import http from 'http';
import { exec } from 'child_process';

const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  
  let cmd = '';
  if (url.pathname === '/api/sessions') cmd = 'openclaw sessions --json';
  else if (url.pathname === '/api/cron/list') cmd = 'openclaw cron list --json';
  else if (url.pathname === '/api/cron/status') cmd = 'openclaw cron status --json';
  else if (url.pathname === '/api/status') cmd = 'openclaw status --json';
  else if (url.pathname === '/api/emergency/stop') cmd = 'openclaw sessions list --json | jq -r ".sessions[].sessionId" | xargs -I {} openclaw process kill {}';
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  exec(cmd, { env: { ...process.env, NO_COLOR: '1' }, timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Exec error: ${error.message}`);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'CLI failed', details: stderr }));
      return;
    }
    
    // Strip CLI UI lines
    const jsonStr = stdout.split('\n').filter(l => !l.match(/^[│◇├─]/)).join('\n');
    
    try {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(jsonStr);
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Parse failed' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Native Proxy running on http://localhost:${PORT}`);
});
