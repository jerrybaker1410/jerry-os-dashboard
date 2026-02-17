#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// History Logger — Daily snapshot for Jerry OS Dashboard charts
// Run via cron: saves sessions, cron jobs, cost data as JSON
// ═══════════════════════════════════════════════════════════════

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_DIR = path.join(__dirname, '..', 'data', 'history');
const OPENCLAW_CONFIG_PATH = path.join(
  process.env.HOME || '/Users/demetripanici',
  '.openclaw/openclaw.json'
);

// Ensure history dir exists
fs.mkdirSync(HISTORY_DIR, { recursive: true });

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

function parseJSON(raw) {
  if (!raw) return null;
  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) return null;
    return JSON.parse(raw.slice(jsonStart));
  } catch {
    return null;
  }
}

function getOpenRouterKey() {
  try {
    const config = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_PATH, 'utf-8'));
    return config?.models?.providers?.openrouter?.apiKey || null;
  } catch {
    return null;
  }
}

async function collectSnapshot() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timestamp = now.toISOString();

  console.log(`[${timestamp}] Collecting daily snapshot...`);

  // 1. Sessions
  const sessRaw = runCLI('openclaw sessions list --json 2>/dev/null');
  const sessData = parseJSON(sessRaw);
  const sessions = sessData?.sessions || [];

  // Count by type
  const sessionCounts = {
    total: sessions.length,
    main: sessions.filter((s) => s.key?.includes(':main') && !s.key?.includes(':cron:') && !s.key?.includes(':subagent:')).length,
    cron: sessions.filter((s) => s.key?.includes(':cron:')).length,
    subagent: sessions.filter((s) => s.key?.includes(':subagent:')).length,
  };

  // Token totals
  const totalTokens = sessions.reduce((sum, s) => sum + (s.totalTokens || 0), 0);

  // Models in use
  const modelUsage = {};
  sessions.forEach((s) => {
    if (s.model) {
      modelUsage[s.model] = (modelUsage[s.model] || 0) + 1;
    }
  });

  // 2. Cron jobs
  const cronRaw = runCLI('openclaw cron list --json 2>/dev/null');
  const cronData = parseJSON(cronRaw);
  const cronJobs = cronData?.jobs || [];

  const cronCounts = {
    total: cronJobs.length,
    enabled: cronJobs.filter((j) => j.enabled).length,
    disabled: cronJobs.filter((j) => !j.enabled).length,
  };

  // 3. OpenRouter cost data
  let costData = null;
  const apiKey = getOpenRouterKey();
  if (apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      costData = {
        connected: true,
        totalUsage: data.data?.usage || 0,
        usageDaily: data.data?.usage_daily || 0,
        usageWeekly: data.data?.usage_weekly || 0,
        usageMonthly: data.data?.usage_monthly || 0,
        limit: data.data?.limit || null,
        limitRemaining: data.data?.limit_remaining || null,
      };
    } catch (e) {
      costData = { connected: false, error: e.message };
    }
  } else {
    costData = { connected: false, error: 'No API key' };
  }

  // 4. Build snapshot
  const snapshot = {
    date: dateStr,
    timestamp,
    sessions: sessionCounts,
    totalTokens,
    modelUsage,
    cronJobs: cronCounts,
    cost: costData,
  };

  // 5. Save
  const filePath = path.join(HISTORY_DIR, `${dateStr}.json`);

  // If file already exists for today, merge (update with latest)
  if (fs.existsSync(filePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      // Keep the earliest timestamp but update everything else
      snapshot.firstTimestamp = existing.firstTimestamp || existing.timestamp;
      snapshot.updates = (existing.updates || 0) + 1;
    } catch { /* overwrite */ }
  }

  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  console.log(`[${timestamp}] Snapshot saved: ${filePath}`);
  console.log(`  Sessions: ${sessionCounts.total} (${sessionCounts.main} main, ${sessionCounts.cron} cron, ${sessionCounts.subagent} subagent)`);
  console.log(`  Cron jobs: ${cronCounts.total} (${cronCounts.enabled} enabled)`);
  console.log(`  Tokens: ${totalTokens.toLocaleString()}`);
  if (costData?.connected) {
    console.log(`  Cost — Monthly: $${costData.usageMonthly.toFixed(2)}, Daily: $${costData.usageDaily.toFixed(2)}`);
  } else {
    console.log(`  Cost — Not connected: ${costData?.error || 'unknown'}`);
  }

  return snapshot;
}

// Run
collectSnapshot()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
