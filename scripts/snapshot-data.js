import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';

const env = { ...process.env, NO_COLOR: '1' };

function runCLI(cmd) {
  try {
    const raw = execSync(cmd, { encoding: 'utf-8', timeout: 15000, env });
    const lines = raw.split('\n').filter(l => !l.match(/^[│◇├─]/));
    return JSON.parse(lines.join('\n'));
  } catch (e) {
    console.error(`CLI error [${cmd}]:`, e.message);
    return null;
  }
}

const sessions = runCLI('openclaw sessions --json');
const cronList = runCLI('openclaw cron list --json');
const cronStatus = runCLI('openclaw cron status --json');
const status = runCLI('openclaw status --json');

const snapshot = {
  sessions,
  cronList,
  cronStatus,
  status,
  snapshotAt: Date.now(),
};

mkdirSync('public', { recursive: true });
writeFileSync('public/data-snapshot.json', JSON.stringify(snapshot, null, 2));
console.log(`Snapshot saved: ${Object.keys(snapshot).length} keys, ${JSON.stringify(snapshot).length} bytes`);
