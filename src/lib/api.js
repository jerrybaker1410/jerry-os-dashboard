// API client — currently returns mock data
// When connecting to real OpenClaw/OpenRouter, swap these implementations

import {
  mockSessions,
  mockTasks,
  mockCostData,
  mockAgentStats,
  mockRecentActivity,
  mockSessionLogs,
} from '../data/mockData';

const MOCK_MODE = true;

// Simulates API delay
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ─── OpenClaw Gateway ───────────────────────────────────────────

export async function fetchSessions() {
  if (MOCK_MODE) {
    await delay(200);
    return mockSessions;
  }
  const res = await fetch('/api/sessions_list');
  return res.json();
}

export async function fetchSessionStatus(sessionId) {
  if (MOCK_MODE) {
    await delay(150);
    return mockSessions.find((s) => s.id === sessionId) || null;
  }
  const res = await fetch(`/api/session_status?id=${sessionId}`);
  return res.json();
}

export async function fetchCronJobs() {
  if (MOCK_MODE) {
    await delay(200);
    return mockTasks.filter((t) => t.type === 'cron');
  }
  const res = await fetch('/api/cron/list');
  return res.json();
}

export async function fetchTaskQueue() {
  if (MOCK_MODE) {
    await delay(200);
    return mockTasks;
  }
  const [crons, sessions] = await Promise.all([fetchCronJobs(), fetchSessions()]);
  return [...crons, ...sessions.flatMap((s) => s.tasks || [])];
}

// ─── OpenRouter / Cost Data ─────────────────────────────────────

export async function fetchCostData() {
  if (MOCK_MODE) {
    await delay(250);
    return mockCostData;
  }
  const [keyRes, genRes] = await Promise.all([
    fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    }),
    fetch('https://openrouter.ai/api/v1/generation?limit=100', {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    }),
  ]);
  return { key: await keyRes.json(), generations: await genRes.json() };
}

// ─── Aggregated Dashboard Data ──────────────────────────────────

export async function fetchDashboardData() {
  if (MOCK_MODE) {
    await delay(300);
    return {
      sessions: mockSessions,
      tasks: mockTasks,
      costs: mockCostData,
      agentStats: mockAgentStats,
      recentActivity: mockRecentActivity,
    };
  }
  const [sessions, tasks, costs] = await Promise.all([
    fetchSessions(),
    fetchCronJobs(),
    fetchCostData(),
  ]);
  return { sessions, tasks, costs, agentStats: [], recentActivity: [] };
}

export async function fetchSessionLogs(sessionId) {
  if (MOCK_MODE) {
    await delay(200);
    return mockSessionLogs[sessionId] || [];
  }
  const res = await fetch(`/api/session_logs?id=${sessionId}`);
  return res.json();
}

// ─── Gateway Status (for AgentProfiles) ─────────────────────────

export async function fetchStatus() {
  if (MOCK_MODE) {
    await delay(200);
    return {
      heartbeat: {
        agents: mockAgentStats.map((a) => ({
          agentId: a.id,
          enabled: a.status === 'active',
          every: '30m',
        })),
      },
    };
  }
  const res = await fetch('/api/status');
  return res.json();
}

// ─── Helpers ────────────────────────────────────────────────────

function getApiKey() {
  return localStorage.getItem('openrouter_key') || '';
}
