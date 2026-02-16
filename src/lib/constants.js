// Agent definitions
export const AGENTS = {
  JERRY: { id: 'jerry', name: 'Jerry Baker', role: 'Chief of Staff', emoji: '🧠', color: '#3b82f6' },
  CONTENT: { id: 'content', name: 'Content Team', role: 'Content Pipeline', emoji: '✍️', color: '#8b5cf6' },
  OUTREACH: { id: 'outreach', name: 'Outreach Agent', role: 'Lead Gen & Podcast', emoji: '📧', color: '#22c55e' },
  RESEARCH: { id: 'research', name: 'Research Agent', role: 'Market Intel', emoji: '🔍', color: '#eab308' },
  OPS: { id: 'ops', name: 'Ops Agent', role: 'Automation & Infra', emoji: '⚙️', color: '#ef4444' },
};

// Task statuses
export const TASK_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  WAITING: 'waiting',
};

export const STATUS_COLORS = {
  active: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  queued: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  running: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  completed: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  waiting: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  idle: { bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-500' },
};

// Models and pricing
export const MODEL_COSTS = {
  'claude-sonnet-4-20250514': { input: 3, output: 15, name: 'Sonnet 4' },
  'claude-haiku-3.5': { input: 0.25, output: 1.25, name: 'Haiku 3.5' },
  'gpt-4o': { input: 2.5, output: 10, name: 'GPT-4o' },
  'gpt-4o-mini': { input: 0.15, output: 0.6, name: 'GPT-4o Mini' },
  'deepseek-r1': { input: 0.55, output: 2.19, name: 'DeepSeek R1' },
};

// Refresh intervals
export const REFRESH_INTERVALS = {
  SESSIONS: 30000,
  TASKS: 30000,
  COSTS: 60000,
};

// Navigation
export const NAV_ITEMS = [
  { path: '/', label: 'Command Center', icon: 'LayoutDashboard' },
  { path: '/tasks', label: 'Task Queue', icon: 'ListTodo' },
  { path: '/costs', label: 'Cost Analytics', icon: 'DollarSign' },
  { path: '/sessions', label: 'Sessions & Logs', icon: 'Terminal' },
];
