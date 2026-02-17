#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Jerry OS Dashboard — Backend API Server
// Proxies OpenClaw CLI + OpenRouter API into REST endpoints
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Config ─────────────────────────────────────────────────────

const OPENCLAW_CONFIG_PATH = path.join(
  process.env.HOME || '/Users/demetripanici',
  '.openclaw/openclaw.json'
);

const HISTORY_DIR = path.join(__dirname, '..', 'data', 'history');
const WORKSPACE_DIR = path.join(process.env.HOME || '/Users/demetripanici', '.openclaw/workspace');
const BRAIN_DIR = path.join(process.env.HOME || '/Users/demetripanici', '.openclaw/brain');

function getOpenClawConfig() {
  try {
    return JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

function getOpenRouterKey() {
  const config = getOpenClawConfig();
  return config?.models?.providers?.openrouter?.apiKey || null;
}

// ─── CORS ───────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ─── Helper: run CLI command ────────────────────────────────────

function runCLI(cmd, timeoutMs = 15000) {
  try {
    const result = execSync(cmd, {
      timeout: timeoutMs,
      encoding: 'utf-8',
      env: { ...process.env, NO_COLOR: '1' },
    });
    return result;
  } catch (err) {
    console.error(`CLI error for "${cmd}":`, err.message);
    return null;
  }
}

// ─── API: Sessions List ─────────────────────────────────────────

app.get('/api/sessions_list', (req, res) => {
  const raw = runCLI('openclaw sessions list --json 2>/dev/null');
  if (!raw) return res.json({ sessions: [], error: 'Failed to fetch sessions' });

  try {
    // Strip any non-JSON prefix lines (doctor warnings etc)
    const jsonStart = raw.indexOf('{');
    const parsed = JSON.parse(raw.slice(jsonStart));
    res.json(parsed);
  } catch (e) {
    res.json({ sessions: [], error: 'Failed to parse sessions JSON' });
  }
});

// ─── API: Cron Jobs ─────────────────────────────────────────────

app.get('/api/cron/list', (req, res) => {
  const raw = runCLI('openclaw cron list --json 2>/dev/null');
  if (!raw) return res.json({ jobs: [], error: 'Failed to fetch cron jobs' });

  try {
    const jsonStart = raw.indexOf('{');
    const parsed = JSON.parse(raw.slice(jsonStart));
    res.json(parsed);
  } catch (e) {
    res.json({ jobs: [], error: 'Failed to parse cron JSON' });
  }
});

// ─── API: OpenRouter Key Info (credit balance) ──────────────────

app.get('/api/openrouter/key', async (req, res) => {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    return res.json({ connected: false, error: 'No OpenRouter API key configured' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json();
    res.json({ connected: true, ...data });
  } catch (e) {
    res.json({ connected: false, error: e.message });
  }
});

// ─── API: OpenRouter Generation Stats ───────────────────────────
// Note: The OpenRouter /generation endpoint requires an 'id' param,
// so we use /auth/key which gives us usage data instead.

app.get('/api/openrouter/usage', async (req, res) => {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    return res.json({ connected: false, error: 'No OpenRouter API key configured' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json();
    res.json({
      connected: true,
      usage: data.data?.usage || 0,
      usageDaily: data.data?.usage_daily || 0,
      usageWeekly: data.data?.usage_weekly || 0,
      usageMonthly: data.data?.usage_monthly || 0,
      limit: data.data?.limit || null,
      limitRemaining: data.data?.limit_remaining || null,
    });
  } catch (e) {
    res.json({ connected: false, error: e.message });
  }
});

// ─── API: OpenClaw Config (models, agents) ──────────────────────

app.get('/api/config', (req, res) => {
  const config = getOpenClawConfig();
  if (!config) return res.json({ error: 'Could not read OpenClaw config' });

  // Return sanitized config (no API keys)
  const models = config.models?.providers?.openrouter?.models || [];
  const agents = config.agents || {};

  res.json({
    models: models.map((m) => ({
      id: m.id,
      name: m.name,
      cost: m.cost,
      contextWindow: m.contextWindow,
    })),
    defaultModel: agents.defaults?.model?.primary || 'unknown',
    fallbacks: agents.defaults?.model?.fallbacks || [],
  });
});

// ─── API: Activity Feed (derived from cron + sessions) ──────────

app.get('/api/activity', (req, res) => {
  const activities = [];

  // Get sessions
  const sessRaw = runCLI('openclaw sessions list --json 2>/dev/null');
  if (sessRaw) {
    try {
      const jsonStart = sessRaw.indexOf('{');
      const { sessions = [] } = JSON.parse(sessRaw.slice(jsonStart));
      sessions.forEach((s) => {
        const keyParts = (s.key || '').split(':');
        const type = keyParts[2] || 'unknown'; // main, subagent, cron
        const agentId = keyParts[1] || 'unknown';

        activities.push({
          id: `sess-${s.sessionId || s.key}`,
          time: new Date(s.updatedAt).toISOString(),
          agent: agentId,
          type: type === 'cron' ? 'cron_run' : type === 'subagent' ? 'subagent' : 'session',
          message: `${type === 'cron' ? 'Cron session' : type === 'subagent' ? 'Subagent' : 'Main session'} — ${s.model || 'unknown model'} (${s.totalTokens ? s.totalTokens.toLocaleString() + ' tokens' : 'tokens unknown'})`,
          model: s.model,
          tokens: s.totalTokens,
          ageMs: s.ageMs,
        });
      });
    } catch { /* ignore */ }
  }

  // Get cron jobs
  const cronRaw = runCLI('openclaw cron list --json 2>/dev/null');
  if (cronRaw) {
    try {
      const jsonStart = cronRaw.indexOf('{');
      const { jobs = [] } = JSON.parse(cronRaw.slice(jsonStart));
      jobs.forEach((job) => {
        if (job.state?.lastRunAtMs) {
          activities.push({
            id: `cron-${job.id}`,
            time: new Date(job.state.lastRunAtMs).toISOString(),
            agent: job.agentId || 'default',
            type: 'cron_complete',
            message: `Cron completed: ${job.name}`,
            status: job.state.lastResult || 'ok',
          });
        }
        if (job.state?.nextRunAtMs) {
          activities.push({
            id: `cron-next-${job.id}`,
            time: new Date(job.state.nextRunAtMs).toISOString(),
            agent: job.agentId || 'default',
            type: 'cron_scheduled',
            message: `Scheduled: ${job.name}`,
            schedule: job.schedule?.expr,
          });
        }
      });
    } catch { /* ignore */ }
  }

  // Sort by time, most recent first
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json({ activities: activities.slice(0, 50) });
});

// ─── API: History data (for charts) ─────────────────────────────

app.get('/api/history', (req, res) => {
  try {
    if (!fs.existsSync(HISTORY_DIR)) {
      return res.json({ snapshots: [], error: 'No history data yet. Run history-logger to populate.' });
    }

    const files = fs.readdirSync(HISTORY_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort();

    const snapshots = files.map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, f), 'utf-8'));
      } catch {
        return null;
      }
    }).filter(Boolean);

    res.json({ snapshots });
  } catch (e) {
    res.json({ snapshots: [], error: e.message });
  }
});

// ─── API: Dashboard aggregate ───────────────────────────────────

app.get('/api/dashboard', async (req, res) => {
  // Parallel fetch all data sources
  const [sessRaw, cronRaw] = [
    runCLI('openclaw sessions list --json 2>/dev/null'),
    runCLI('openclaw cron list --json 2>/dev/null'),
  ];

  let sessions = [];
  let cronJobs = [];

  if (sessRaw) {
    try {
      const jsonStart = sessRaw.indexOf('{');
      const parsed = JSON.parse(sessRaw.slice(jsonStart));
      sessions = parsed.sessions || [];
    } catch { /* ignore */ }
  }

  if (cronRaw) {
    try {
      const jsonStart = cronRaw.indexOf('{');
      const parsed = JSON.parse(cronRaw.slice(jsonStart));
      cronJobs = parsed.jobs || [];
    } catch { /* ignore */ }
  }

  // OpenRouter usage
  let openrouterUsage = null;
  const apiKey = getOpenRouterKey();
  if (apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      openrouterUsage = {
        connected: true,
        usage: data.data?.usage || 0,
        usageDaily: data.data?.usage_daily || 0,
        usageWeekly: data.data?.usage_weekly || 0,
        usageMonthly: data.data?.usage_monthly || 0,
        limit: data.data?.limit || null,
        limitRemaining: data.data?.limit_remaining || null,
      };
    } catch {
      openrouterUsage = { connected: false };
    }
  } else {
    openrouterUsage = { connected: false, error: 'No API key' };
  }

  // History snapshots for charts
  let historySnapshots = [];
  try {
    if (fs.existsSync(HISTORY_DIR)) {
      const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith('.json')).sort();
      historySnapshots = files.slice(-30).map((f) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, f), 'utf-8'));
        } catch { return null; }
      }).filter(Boolean);
    }
  } catch { /* ignore */ }

  // Config info
  const config = getOpenClawConfig();
  const configModels = config?.models?.providers?.openrouter?.models || [];

  res.json({
    sessions,
    cronJobs,
    openrouterUsage,
    historySnapshots,
    config: {
      models: configModels.map((m) => ({
        id: m.id,
        name: m.name,
        cost: m.cost,
        contextWindow: m.contextWindow,
      })),
      defaultModel: config?.agents?.defaults?.model?.primary || 'unknown',
    },
  });
});

// ─── API: Cron Run History ─────────────────────────────────

app.get('/api/cron/runs', (req, res) => {
  const jobId = req.query.jobId;
  const limit = parseInt(req.query.limit) || 10;
  if (!jobId) return res.json({ runs: [], error: 'jobId is required' });

  const raw = runCLI(`openclaw cron runs --id "${jobId}" --limit ${limit} --json 2>/dev/null`);
  if (!raw) return res.json({ runs: [] });

  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) return res.json({ runs: [] });
    const parsed = JSON.parse(raw.slice(jsonStart));
    res.json({ runs: parsed.entries || parsed.runs || [] });
  } catch {
    res.json({ runs: [] });
  }
});

// ─── API: Memory Search ──────────────────────────────────────

app.get('/api/memory/search', (req, res) => {
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 20;
  if (!query) return res.json({ results: [], error: 'q is required' });

  const raw = runCLI(`openclaw memory search "${query.replace(/"/g, '\\"')}" --json --max-results ${limit} 2>/dev/null`, 20000);
  if (!raw) return res.json({ results: [] });

  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) {
      // Try array format
      const arrStart = raw.indexOf('[');
      if (arrStart === -1) return res.json({ results: [] });
      const parsed = JSON.parse(raw.slice(arrStart));
      return res.json({ results: Array.isArray(parsed) ? parsed : [] });
    }
    const parsed = JSON.parse(raw.slice(jsonStart));
    res.json({ results: parsed.results || [] });
  } catch {
    res.json({ results: [] });
  }
});

// ─── API: Memory Content ─────────────────────────────────────

app.get('/api/memory/content', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.json({ error: 'path is required' });

  // Security: prevent path traversal
  const resolved = path.resolve(WORKSPACE_DIR, 'memory', filePath);
  if (!resolved.startsWith(path.resolve(WORKSPACE_DIR))) {
    return res.status(403).json({ error: 'Invalid path' });
  }

  try {
    if (!fs.existsSync(resolved)) {
      return res.json({ content: null, error: 'File not found' });
    }
    const content = fs.readFileSync(resolved, 'utf-8');
    res.json({ content, path: filePath });
  } catch (e) {
    res.json({ content: null, error: e.message });
  }
});

// ─── API: Goals ──────────────────────────────────────────────

app.get('/api/goals', (req, res) => {
  const goalsPath = path.join(BRAIN_DIR, 'goals', 'goals.md');
  try {
    if (!fs.existsSync(goalsPath)) {
      return res.json({ content: null, error: 'Goals file not found' });
    }
    const content = fs.readFileSync(goalsPath, 'utf-8');
    res.json({ content, path: 'brain/goals/goals.md' });
  } catch (e) {
    res.json({ content: null, error: e.message });
  }
});

// ─── API: Agent Fleet ────────────────────────────────────────

app.get('/api/agents', (req, res) => {
  const config = getOpenClawConfig();
  const agents = config?.agents || {};

  // Get live session data
  const sessRaw = runCLI('openclaw sessions list --json 2>/dev/null');
  let sessions = [];
  if (sessRaw) {
    try {
      const jsonStart = sessRaw.indexOf('{');
      const parsed = JSON.parse(sessRaw.slice(jsonStart));
      sessions = parsed.sessions || [];
    } catch { /* ignore */ }
  }

  // Build agent info from config
  const agentEntries = Object.entries(agents)
    .filter(([key]) => key !== 'defaults')
    .map(([agentId, agentConfig]) => {
      const agentSessions = sessions.filter((s) => {
        const parts = (s.key || '').split(':');
        return parts[1] === agentId;
      });

      return {
        agentId,
        model: agentConfig.model?.primary || agents.defaults?.model?.primary || 'unknown',
        workspace: agentConfig.workspace || null,
        sessionCount: agentSessions.length,
        activeSessions: agentSessions.filter((s) => s.ageMs != null && s.ageMs < 600000).length,
        totalTokens: agentSessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0),
      };
    });

  res.json({ agents: agentEntries });
});

// ─── API: Gateway Health ─────────────────────────────────────

app.get('/api/gateway/health', (req, res) => {
  const raw = runCLI('openclaw gateway health --json 2>/dev/null', 20000);
  if (!raw) return res.json({ ok: false, error: 'Failed to fetch gateway health' });

  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) return res.json({ ok: false, error: 'No JSON in response' });
    const parsed = JSON.parse(raw.slice(jsonStart));
    res.json(parsed);
  } catch {
    res.json({ ok: false, error: 'Failed to parse gateway health' });
  }
});

// ─── API: Gateway Status (service + probe) ──────────────────

app.get('/api/gateway/status', (req, res) => {
  const raw = runCLI('openclaw gateway status --json 2>/dev/null', 20000);
  if (!raw) return res.json({ error: 'Failed to fetch gateway status' });

  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) return res.json({ error: 'No JSON in response' });
    const parsed = JSON.parse(raw.slice(jsonStart));
    res.json(parsed);
  } catch {
    res.json({ error: 'Failed to parse gateway status' });
  }
});

// ─── API: Channels Status ───────────────────────────────────

app.get('/api/channels', (req, res) => {
  const raw = runCLI('openclaw channels status --json 2>/dev/null', 20000);
  if (!raw) return res.json({ channels: {}, error: 'Failed to fetch channels' });

  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) return res.json({ channels: {} });
    const parsed = JSON.parse(raw.slice(jsonStart));
    res.json(parsed);
  } catch {
    res.json({ channels: {}, error: 'Failed to parse channels' });
  }
});

// ─── API: Cron Toggle (enable/disable) ──────────────────────

app.use(express.json());

app.post('/api/cron/toggle', (req, res) => {
  const { jobId, enabled } = req.body || {};
  if (!jobId) return res.json({ success: false, error: 'jobId is required' });

  const action = enabled ? 'enable' : 'disable';
  const raw = runCLI(`openclaw cron ${action} "${jobId}" 2>/dev/null`, 15000);
  res.json({ success: raw !== null, action, jobId });
});

// ─── API: Cron Run Now ──────────────────────────────────────

app.post('/api/cron/run', (req, res) => {
  const { jobId } = req.body || {};
  if (!jobId) return res.json({ success: false, error: 'jobId is required' });

  const raw = runCLI(`openclaw cron run "${jobId}" 2>/dev/null`, 30000);
  res.json({ success: raw !== null, jobId });
});

// ─── API: Memory Status ─────────────────────────────────────

app.get('/api/memory/status', (req, res) => {
  const raw = runCLI('openclaw memory status --json 2>/dev/null', 15000);
  if (!raw) return res.json({ error: 'Failed to fetch memory status' });

  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) {
      const arrStart = raw.indexOf('[');
      if (arrStart !== -1) return res.json(JSON.parse(raw.slice(arrStart)));
      return res.json({ error: 'No JSON in response' });
    }
    res.json(JSON.parse(raw.slice(jsonStart)));
  } catch {
    res.json({ error: 'Failed to parse memory status' });
  }
});

// ─── API: Morning Brief ─────────────────────────────────────

app.get('/api/brief', async (req, res) => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Fetch sessions and cron data
  const sessRaw = runCLI('openclaw sessions list --json 2>/dev/null');
  const cronRaw = runCLI('openclaw cron list --json 2>/dev/null');

  let sessions = [];
  let cronJobs = [];

  if (sessRaw) {
    try {
      const jsonStart = sessRaw.indexOf('{');
      sessions = JSON.parse(sessRaw.slice(jsonStart)).sessions || [];
    } catch { /* ignore */ }
  }

  if (cronRaw) {
    try {
      const jsonStart = cronRaw.indexOf('{');
      cronJobs = JSON.parse(cronRaw.slice(jsonStart)).jobs || [];
    } catch { /* ignore */ }
  }

  // Sessions in last 24h
  const recentSessions = sessions.filter((s) => s.ageMs != null && s.ageMs < oneDayMs);
  const activeSessions = sessions.filter((s) => s.ageMs != null && s.ageMs < 600000);

  // Cron runs from last 24h
  const cronRunsSince = cronJobs.filter((j) => {
    const lastRun = j.state?.lastRunAtMs;
    return lastRun && (now - lastRun) < oneDayMs;
  }).map((j) => ({
    id: j.id,
    name: j.name,
    agentId: j.agentId,
    lastRunAt: j.state.lastRunAtMs,
    result: j.state.lastResult || 'unknown',
  }));

  // Upcoming crons in the next 12h
  const twelveHoursMs = 12 * 60 * 60 * 1000;
  const upcomingCrons = cronJobs
    .filter((j) => j.enabled !== false && j.state?.nextRunAtMs && (j.state.nextRunAtMs - now) < twelveHoursMs && j.state.nextRunAtMs > now)
    .map((j) => ({
      id: j.id,
      name: j.name,
      agentId: j.agentId,
      nextRunAt: j.state.nextRunAtMs,
      schedule: j.schedule?.expr,
    }))
    .sort((a, b) => a.nextRunAt - b.nextRunAt);

  // OpenRouter cost today
  let costToday = null;
  const apiKey = getOpenRouterKey();
  if (apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      costToday = {
        daily: data.data?.usage_daily || 0,
        weekly: data.data?.usage_weekly || 0,
        monthly: data.data?.usage_monthly || 0,
        limit: data.data?.limit || null,
        limitRemaining: data.data?.limit_remaining || null,
      };
    } catch { /* ignore */ }
  }

  // Total tokens from recent sessions
  const totalTokens = recentSessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);

  // Goals file
  let goals = null;
  const goalsPath = path.join(BRAIN_DIR, 'goals', 'goals.md');
  try {
    if (fs.existsSync(goalsPath)) {
      goals = fs.readFileSync(goalsPath, 'utf-8');
    }
  } catch { /* ignore */ }

  res.json({
    asOf: new Date().toISOString(),
    sessionsSince24h: recentSessions.length,
    activeSessions: activeSessions.length,
    totalTokens,
    cronRunsSince24h: cronRunsSince,
    upcomingCrons,
    costToday,
    totalCronJobs: cronJobs.length,
    enabledCronJobs: cronJobs.filter((j) => j.enabled !== false).length,
    goals,
  });
});

// ─── API: Emergency Stop ─────────────────────────────────────

app.post('/api/emergency/stop', (req, res) => {
  const raw = runCLI('openclaw sessions kill --all --json 2>/dev/null', 30000);
  if (!raw) {
    return res.json({ success: false, error: 'Failed to execute emergency stop' });
  }
  res.json({ success: true, message: 'All sessions killed' });
});

// ─── Start ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Jerry OS Dashboard API running on http://localhost:${PORT}`);
});
