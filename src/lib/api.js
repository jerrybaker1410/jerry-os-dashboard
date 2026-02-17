// ═══════════════════════════════════════════════════════════════
// API Client — Jerry OS Dashboard
// Fetches REAL data from the backend API server (Express on :3001)
// NO mock data, NO fallbacks — errors propagate to the UI
// ═══════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_BASE || `${import.meta.env.BASE_URL}api`;

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── OpenClaw Gateway ───────────────────────────────────────────

export async function fetchSessions() {
  const data = await apiFetch('/sessions_list');
  return data.sessions || [];
}

export async function fetchCronJobs() {
  const data = await apiFetch('/cron/list');
  return data.jobs || [];
}

// ─── OpenRouter / Cost Data ─────────────────────────────────────

export async function fetchCostData() {
  const data = await apiFetch('/openrouter/usage');
  return data;
}

// ─── Activity Feed (derived from real sessions + cron) ──────────

export async function fetchActivity() {
  const data = await apiFetch('/activity');
  return data.activities || [];
}

// ─── History Snapshots (for charts) ─────────────────────────────

export async function fetchHistory() {
  const data = await apiFetch('/history');
  return data.snapshots || [];
}

// ─── Config ─────────────────────────────────────────────────────

export async function fetchConfig() {
  return apiFetch('/config');
}

// ─── Aggregated Dashboard Data ──────────────────────────────────

export async function fetchDashboardData() {
  const data = await apiFetch('/dashboard');
  return data;
}

// ─── Session Logs ───────────────────────────────────────────────
// OpenClaw doesn't expose per-session logs via CLI yet,
// so we return empty and show a message in the UI.

export async function fetchSessionLogs(sessionId) {
  // No real endpoint available yet
  return [];
}

// ─── Gateway Status ─────────────────────────────────────────────

export async function fetchStatus() {
  const data = await apiFetch('/dashboard');
  return {
    sessions: data.sessions || [],
    cronJobs: data.cronJobs || [],
  };
}

// ─── Cron Run History ───────────────────────────────────────

export async function fetchCronRuns(jobId, limit = 10) {
  const data = await apiFetch(`/cron/runs?jobId=${encodeURIComponent(jobId)}&limit=${limit}`);
  return data.runs || [];
}

// ─── Memory Search ──────────────────────────────────────────

export async function fetchMemorySearch(query, limit = 20) {
  const data = await apiFetch(`/memory/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return data.results || [];
}

// ─── Memory Content ─────────────────────────────────────────

export async function fetchMemoryContent(filePath) {
  const data = await apiFetch(`/memory/content?path=${encodeURIComponent(filePath)}`);
  return data;
}

// ─── Goals ──────────────────────────────────────────────────

export async function fetchGoals() {
  const data = await apiFetch('/goals');
  return data;
}

// ─── Agent Fleet ────────────────────────────────────────────

export async function fetchAgentFleet() {
  const data = await apiFetch('/agents');
  return data.agents || [];
}

// ─── Gateway Health ─────────────────────────────────────────

export async function fetchGatewayHealth() {
  return apiFetch('/gateway/health');
}

// ─── Channels Status ────────────────────────────────────────

export async function fetchChannels() {
  return apiFetch('/channels');
}

// ─── Morning Brief ──────────────────────────────────────────

export async function fetchBrief() {
  return apiFetch('/brief');
}

// ─── Memory Status ──────────────────────────────────────────

export async function fetchMemoryStatus() {
  return apiFetch('/memory/status');
}

// ─── Cron Toggle ────────────────────────────────────────────

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export async function toggleCronJob(jobId, enabled) {
  return apiPost('/cron/toggle', { jobId, enabled });
}

export async function triggerCronJob(jobId) {
  return apiPost('/cron/run', { jobId });
}
