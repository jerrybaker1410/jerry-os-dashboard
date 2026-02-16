import express from 'express';
import cors from 'cors';
import { execSync } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

function runCLI(cmd) {
  try {
    const raw = execSync(cmd, { encoding: 'utf-8', timeout: 15000, env: { ...process.env, NO_COLOR: '1' } });
    // Strip doctor warnings (lines starting with │ ◇ ├ ─)
    const lines = raw.split('\n').filter(l => !l.match(/^[│◇├─]/));
    return JSON.parse(lines.join('\n'));
  } catch (e) {
    console.error(`CLI error [${cmd}]:`, e.message);
    return null;
  }
}

// Sessions list
app.get('/api/sessions', (req, res) => {
  const data = runCLI('openclaw sessions --json');
  if (!data) return res.status(500).json({ error: 'Failed to fetch sessions' });
  res.json(data);
});

// Cron list
app.get('/api/cron/list', (req, res) => {
  const data = runCLI('openclaw cron list --json');
  if (!data) return res.status(500).json({ error: 'Failed to fetch cron jobs' });
  res.json(data);
});

// Cron status
app.get('/api/cron/status', (req, res) => {
  const data = runCLI('openclaw cron status --json');
  if (!data) return res.status(500).json({ error: 'Failed to fetch cron status' });
  res.json(data);
});

// Health / agents
app.get('/api/health', (req, res) => {
  const data = runCLI('openclaw health --json');
  if (data) return res.json(data);
  // Fallback: parse text output
  try {
    const raw = execSync('openclaw health 2>&1', { encoding: 'utf-8', timeout: 10000, env: { ...process.env, NO_COLOR: '1' } });
    res.json({ raw });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch health' });
  }
});

// Status (agents, heartbeat)
app.get('/api/status', (req, res) => {
  const data = runCLI('openclaw status --json');
  if (!data) return res.status(500).json({ error: 'Failed to fetch status' });
  res.json(data);
});

// Cron run history
app.get('/api/cron/runs', (req, res) => {
  const { id, limit } = req.query;
  const cmd = id
    ? `openclaw cron runs --json --id ${id}${limit ? ` --limit ${limit}` : ''}`
    : `openclaw cron runs --json${limit ? ` --limit ${limit}` : ''}`;
  const data = runCLI(cmd);
  if (!data) return res.status(500).json({ error: 'Failed to fetch cron runs' });
  res.json(data);
});

// Cron run (trigger)
app.post('/api/cron/run', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing job id' });
  try {
    const raw = execSync(`openclaw cron run ${id} 2>&1`, { encoding: 'utf-8', timeout: 30000, env: { ...process.env, NO_COLOR: '1' } });
    res.json({ success: true, output: raw });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Cron enable/disable
app.post('/api/cron/toggle', (req, res) => {
  const { id, enabled } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing job id' });
  const cmd = enabled ? `openclaw cron enable ${id}` : `openclaw cron disable ${id}`;
  try {
    const raw = execSync(`${cmd} 2>&1`, { encoding: 'utf-8', timeout: 10000, env: { ...process.env, NO_COLOR: '1' } });
    res.json({ success: true, output: raw });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Jerry OS API server running on http://localhost:${PORT}`);
});
