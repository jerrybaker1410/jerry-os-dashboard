const API_BASE = '/api';
let snapshotCache = null;
let snapshotLoading = null;

async function loadSnapshot() {
  if (snapshotCache) return snapshotCache;
  if (snapshotLoading) return snapshotLoading;
  snapshotLoading = fetch(`${import.meta.env.BASE_URL}data-snapshot.json`)
    .then(r => r.ok ? r.json() : null)
    .catch(() => null);
  snapshotCache = await snapshotLoading;
  snapshotLoading = null;
  return snapshotCache;
}

async function fetchJSON(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) throw new Error('Not JSON (API server probably not running)');
    return res.json();
  } catch (e) {
    // Fallback to snapshot
    const snapshot = await loadSnapshot();
    if (!snapshot) throw e;
    const mapping = {
      '/sessions': snapshot.sessions,
      '/cron/list': snapshot.cronList,
      '/cron/status': snapshot.cronStatus,
      '/health': snapshot.health,
      '/status': snapshot.status,
    };
    const match = Object.keys(mapping).find(k => path.startsWith(k));
    if (match && mapping[match]) return mapping[match];
    throw e;
  }
}

async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export const api = {
  getSessions: () => fetchJSON('/sessions'),
  getCronList: () => fetchJSON('/cron/list'),
  getCronStatus: () => fetchJSON('/cron/status'),
  getHealth: () => fetchJSON('/health'),
  getStatus: () => fetchJSON('/status'),
  getCronRuns: (id, limit = 20) => fetchJSON(`/cron/runs?${id ? `id=${id}&` : ''}limit=${limit}`),
  runCron: (id) => postJSON('/cron/run', { id }),
  toggleCron: (id, enabled) => postJSON('/cron/toggle', { id, enabled }),
};
