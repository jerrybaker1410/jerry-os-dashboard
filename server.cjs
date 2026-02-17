const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

function runCLI(cmd) {
  try {
    const raw = execSync(cmd, { encoding: 'utf-8', timeout: 15000, env: { ...process.env, NO_COLOR: '1' } });
    if (!raw) return null;
    const lines = raw.split('\n').filter(l => !l.match(/^[│◇├─]/));
    try {
        return JSON.parse(lines.join('\n'));
    } catch (e) {
        return { raw: raw }; // Fallback if not JSON
    }
  } catch (e) {
    console.error(`CLI error [${cmd}]:`, e.message);
    return null;
  }
}

app.get('/api/sessions', (req, res) => {
  const data = runCLI('openclaw sessions --json');
  res.json(data || { sessions: [] });
});

app.get('/api/cron/list', (req, res) => {
  const data = runCLI('openclaw cron list --json');
  res.json(data || { jobs: [] });
});

app.get('/api/cron/status', (req, res) => {
  const data = runCLI('openclaw cron status --json');
  res.json(data || {});
});

app.get('/api/status', (req, res) => {
  const data = runCLI('openclaw status --json');
  res.json(data || {});
});

app.listen(PORT, () => {
  console.log(`Jerry OS Proxy running on http://localhost:${PORT}`);
});
