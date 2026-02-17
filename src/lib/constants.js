// Agent team definitions
export const AGENT_TEAMS = {
  CORE: { id: 'core', label: 'Core System', color: '#3b82f6' },
  CONTENT: { id: 'content', label: 'Content Production', color: '#8b5cf6' },
  VIDEO: { id: 'video', label: 'Video & Media', color: '#ec4899' },
  SALES: { id: 'sales', label: 'Sales & Growth', color: '#22c55e' },
  PODCAST: { id: 'podcast', label: 'Podcast & Talent', color: '#f97316' },
  DELIVERY: { id: 'delivery', label: 'Strategy & Delivery', color: '#eab308' },
  OPS: { id: 'ops', label: 'Operations', color: '#ef4444' },
};

// Full agent registry — 23 agents across 7 teams
export const AGENTS = {
  // ── Core System ──
  JERRY:              { id: 'main',               name: 'Jerry Baker',       role: 'Chief of Staff',         emoji: '🧠', color: '#3b82f6', team: 'core' },
  OPENCLAW_BUILDER:   { id: 'openclaw-builder',    name: 'OpenClaw Builder',  role: 'System Architect',       emoji: '🔧', color: '#3b82f6', team: 'core' },

  // ── Content Production ──
  TREND_SCOUT:        { id: 'trend-scout',         name: 'Trend Scout',       role: 'Content Lead / Trends',  emoji: '🔍', color: '#8b5cf6', team: 'content' },
  SOCIAL_WRITER:      { id: 'social-writer',       name: 'Social Writer',     role: 'Social Media Content',   emoji: '✍️', color: '#8b5cf6', team: 'content' },
  BLOG_WRITER:        { id: 'blog-writer',         name: 'Blog Writer',       role: 'Long-form Content',      emoji: '📝', color: '#8b5cf6', team: 'content' },
  NEWSLETTER_WRITER:  { id: 'newsletter-writer',   name: 'Newsletter Writer', role: 'Newsletter Content',     emoji: '📰', color: '#8b5cf6', team: 'content' },
  CONTENT_QA:         { id: 'content-qa',          name: 'Content QA',        role: 'Quality Assurance',      emoji: '📋', color: '#8b5cf6', team: 'content' },
  PODCAST_INBOX:      { id: 'podcast-inbox',       name: 'Podcast Inbox',     role: 'Podcast Management',     emoji: '📬', color: '#8b5cf6', team: 'content' },

  // ── Video & Media ──
  SHORTS_SCRIPTER:    { id: 'shorts-scripter',     name: 'Shorts Scripter',   role: 'Short-form Scripts',     emoji: '🎬', color: '#ec4899', team: 'video' },
  THUMBNAIL_DESIGNER: { id: 'thumbnail-designer',  name: 'Thumbnail Designer',role: 'YouTube Thumbnails',     emoji: '🎨', color: '#ec4899', team: 'video' },
  GRAPHICS_DESIGNER:  { id: 'graphics-designer',   name: 'Graphics Designer', role: 'Visual Design',          emoji: '🖼️', color: '#ec4899', team: 'video' },
  BROLL_PRODUCER:     { id: 'broll-producer',       name: 'B-Roll Producer',   role: 'Video Footage',          emoji: '🎞️', color: '#ec4899', team: 'video' },

  // ── Sales & Growth ──
  OUTREACH_AGENT:     { id: 'outreach-agent',      name: 'Outreach Agent',    role: 'Sales Outreach',         emoji: '📤', color: '#22c55e', team: 'sales' },
  LEAD_QUALIFIER:     { id: 'lead-qualifier',       name: 'Lead Qualifier',    role: 'Lead Qualification',     emoji: '🏷️', color: '#22c55e', team: 'sales' },
  LINKEDIN_AGENT:     { id: 'linkedin-agent',       name: 'LinkedIn Agent',    role: 'LinkedIn Management',    emoji: '💼', color: '#22c55e', team: 'sales' },
  CRM_AGENT:          { id: 'crm-agent',            name: 'CRM Agent',         role: 'CRM Management',         emoji: '📊', color: '#22c55e', team: 'sales' },
  ACCOUNT_MANAGER:    { id: 'account-manager',      name: 'Account Manager',   role: 'Account Management',     emoji: '🤝', color: '#22c55e', team: 'sales' },
  ADS_MONITOR:        { id: 'ads-monitor',          name: 'Ads Monitor',       role: 'Paid Ads Monitoring',    emoji: '📈', color: '#22c55e', team: 'sales' },

  // ── Podcast & Talent ──
  GUEST_BOOKER:       { id: 'guest-booker',         name: 'Guest Booker',      role: 'Guest Recruitment',      emoji: '🎯', color: '#f97316', team: 'podcast' },
  EPISODE_MINER:      { id: 'episode-miner',        name: 'Episode Miner',     role: 'Episode Analysis',       emoji: '⛏️', color: '#f97316', team: 'podcast' },

  // ── Strategy & Delivery ──
  ADS_STRATEGIST:     { id: 'ads-strategist',       name: 'Ads Strategist',    role: 'Paid Ads Strategy',      emoji: '🎯', color: '#eab308', team: 'delivery' },
  SOLUTION_ARCHITECT: { id: 'solution-architect',   name: 'Solution Architect',role: 'System Architecture',    emoji: '🏗️', color: '#eab308', team: 'delivery' },
  DELIVERY_PM:        { id: 'delivery-pm',          name: 'Delivery PM',       role: 'Project Delivery',       emoji: '📋', color: '#eab308', team: 'delivery' },

  // ── Operations ──
  CONTENT_SCHEDULER:  { id: 'content-scheduler',    name: 'Content Scheduler', role: 'Publishing & Scheduling',emoji: '📅', color: '#ef4444', team: 'ops' },
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

// Navigation — grouped by section for sidebar rendering
export const NAV_ITEMS = [
  // Operations
  { path: '/', label: 'Command Center', icon: 'LayoutDashboard', section: 'Operations' },
  { path: '/tasks', label: 'Cron Operations', icon: 'Clock', section: 'Operations' },
  { path: '/sessions', label: 'Sessions & Logs', icon: 'Terminal', section: 'Operations' },
  // Fleet
  { path: '/agents', label: 'Agent Fleet', icon: 'Users', section: 'Fleet' },
  { path: '/memory', label: 'Memory Browser', icon: 'Brain', section: 'Fleet' },
  // Analytics
  { path: '/costs', label: 'Cost Analytics', icon: 'DollarSign', section: 'Analytics' },
  { path: '/brief', label: 'Morning Brief', icon: 'Sun', section: 'Analytics' },
  { path: '/goals', label: 'Goal Tracker', icon: 'Target', section: 'Analytics' },
  // System
  { path: '/health', label: 'System Health', icon: 'Activity', section: 'System' },
  { path: '/kanban', label: 'Kanban Board', icon: 'KanbanSquare', section: 'System' },
];

// Cost budget thresholds (daily, USD)
export const COST_THRESHOLDS = {
  target: 12,
  warning: 15,
  critical: 18,
};
