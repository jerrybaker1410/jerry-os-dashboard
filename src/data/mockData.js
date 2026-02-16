// ═══════════════════════════════════════════════════════════════
// MOCK DATA — Jerry OS Dashboard
// Realistic data for 5 agents over 30 days
// ═══════════════════════════════════════════════════════════════

const now = new Date();
const ago = (mins) => new Date(now - mins * 60000).toISOString();
const daysAgo = (days) => new Date(now - days * 86400000).toISOString();

// ─── Sessions ───────────────────────────────────────────────────

export const mockSessions = [
  {
    id: 'ses_001',
    agent: 'jerry',
    agentName: 'Jerry Baker',
    status: 'active',
    startedAt: ago(12),
    task: 'Morning briefing + task delegation',
    model: 'claude-sonnet-4-20250514',
    tokensIn: 4200,
    tokensOut: 1850,
    cost: 0.042,
    tools: ['todoist', 'slack', 'grain'],
  },
  {
    id: 'ses_002',
    agent: 'content',
    agentName: 'Content Team',
    status: 'active',
    startedAt: ago(8),
    task: 'Writing LinkedIn post — AI automation ROI',
    model: 'claude-sonnet-4-20250514',
    tokensIn: 3100,
    tokensOut: 2200,
    cost: 0.039,
    tools: ['buffer', 'contentstudio'],
  },
  {
    id: 'ses_003',
    agent: 'outreach',
    agentName: 'Outreach Agent',
    status: 'completed',
    startedAt: ago(45),
    endedAt: ago(22),
    task: 'Podcast outreach — 15 new hosts contacted',
    model: 'claude-haiku-3.5',
    tokensIn: 8900,
    tokensOut: 3400,
    cost: 0.006,
    tools: ['instantly', 'podengine', 'hunter'],
  },
  {
    id: 'ses_004',
    agent: 'research',
    agentName: 'Research Agent',
    status: 'completed',
    startedAt: ago(120),
    endedAt: ago(95),
    task: 'Competitor analysis — AI consulting landscape Q1',
    model: 'gpt-4o',
    tokensIn: 12000,
    tokensOut: 5600,
    cost: 0.086,
    tools: ['perplexity', 'google-drive'],
  },
  {
    id: 'ses_005',
    agent: 'ops',
    agentName: 'Ops Agent',
    status: 'idle',
    startedAt: ago(180),
    endedAt: ago(165),
    task: 'Make.com scenario health check',
    model: 'gpt-4o-mini',
    tokensIn: 2100,
    tokensOut: 800,
    cost: 0.001,
    tools: ['make'],
  },
  {
    id: 'ses_006',
    agent: 'jerry',
    agentName: 'Jerry Baker',
    status: 'completed',
    startedAt: daysAgo(1),
    endedAt: ago(1380),
    task: 'End-of-day summary + Notion update',
    model: 'claude-sonnet-4-20250514',
    tokensIn: 5500,
    tokensOut: 3200,
    cost: 0.064,
    tools: ['notion', 'todoist', 'slack'],
  },
];

// ─── Tasks ──────────────────────────────────────────────────────

export const mockTasks = [
  {
    id: 'tsk_001', agent: 'jerry', agentName: 'Jerry Baker',
    title: 'Morning standup briefing',
    status: 'running', priority: 'high', type: 'cron',
    startedAt: ago(12), estimatedDuration: 900,
    model: 'claude-sonnet-4-20250514', tokensUsed: 6050, cost: 0.042,
    description: 'Compile overnight activity, prioritize daily tasks, send Slack summary',
  },
  {
    id: 'tsk_002', agent: 'content', agentName: 'Content Team',
    title: 'LinkedIn post — "The 80/20 Flip"',
    status: 'running', priority: 'high', type: 'scheduled',
    startedAt: ago(8), estimatedDuration: 600,
    model: 'claude-sonnet-4-20250514', tokensUsed: 5300, cost: 0.039,
    description: 'Draft + format LinkedIn post about automating 80% busywork',
  },
  {
    id: 'tsk_003', agent: 'outreach', agentName: 'Outreach Agent',
    title: 'Podcast host follow-ups (batch 12)',
    status: 'queued', priority: 'medium', type: 'cron',
    scheduledFor: ago(-30),
    model: 'claude-haiku-3.5', tokensUsed: 0, cost: 0,
    description: 'Follow up with 8 podcast hosts who opened but didn\'t reply',
  },
  {
    id: 'tsk_004', agent: 'research', agentName: 'Research Agent',
    title: 'Weekly AI news digest',
    status: 'queued', priority: 'medium', type: 'cron',
    scheduledFor: ago(-60),
    model: 'gpt-4o', tokensUsed: 0, cost: 0,
    description: 'Scan 12 sources for AI agent/automation news, produce digest',
  },
  {
    id: 'tsk_005', agent: 'ops', agentName: 'Ops Agent',
    title: 'Notion content calendar sync',
    status: 'waiting', priority: 'low', type: 'cron',
    scheduledFor: ago(-120),
    model: 'gpt-4o-mini', tokensUsed: 0, cost: 0,
    description: 'Sync ContentStudio schedule → Notion database',
    dependsOn: 'tsk_002',
  },
  {
    id: 'tsk_006', agent: 'jerry', agentName: 'Jerry Baker',
    title: 'Client discovery prep — Acme Corp',
    status: 'queued', priority: 'high', type: 'manual',
    scheduledFor: ago(-180),
    model: 'claude-sonnet-4-20250514', tokensUsed: 0, cost: 0,
    description: 'Research Acme Corp, prep discovery questions, create Grain template',
  },
  {
    id: 'tsk_007', agent: 'content', agentName: 'Content Team',
    title: 'YouTube script — "5 AI Agents Running My Business"',
    status: 'completed', priority: 'high', type: 'manual',
    startedAt: daysAgo(1), completedAt: ago(1200),
    model: 'claude-sonnet-4-20250514', tokensUsed: 18200, cost: 0.156,
    description: 'Full YouTube script with hooks, b-roll notes, timestamps',
  },
  {
    id: 'tsk_008', agent: 'outreach', agentName: 'Outreach Agent',
    title: 'Instantly campaign — AI consulting leads',
    status: 'completed', priority: 'medium', type: 'cron',
    startedAt: ago(45), completedAt: ago(22),
    model: 'claude-haiku-3.5', tokensUsed: 12300, cost: 0.006,
    description: 'Sent 15 personalized outreach emails to podcast hosts',
  },
  {
    id: 'tsk_009', agent: 'research', agentName: 'Research Agent',
    title: 'Lead qualification — 3 inbound requests',
    status: 'failed', priority: 'high', type: 'manual',
    startedAt: ago(90), failedAt: ago(85),
    model: 'gpt-4o', tokensUsed: 3400, cost: 0.023,
    description: 'API rate limit hit on Hunter.io — retry scheduled',
    error: 'Hunter.io API rate limit exceeded (429)',
  },
  {
    id: 'tsk_010', agent: 'jerry', agentName: 'Jerry Baker',
    title: 'Weekly metrics report',
    status: 'completed', priority: 'medium', type: 'cron',
    startedAt: daysAgo(2), completedAt: daysAgo(2),
    model: 'claude-sonnet-4-20250514', tokensUsed: 9800, cost: 0.091,
    description: 'Compiled weekly KPIs: content output, outreach metrics, costs',
  },
];

// ─── Cost Data ──────────────────────────────────────────────────

const generateDailyCosts = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCost = isWeekend ? 0.15 : 0.45;
    const variance = (Math.random() - 0.3) * 0.25;
    days.push({
      date: date.toISOString().split('T')[0],
      total: Math.max(0.05, baseCost + variance),
      byAgent: {
        jerry: Math.max(0.01, (baseCost * 0.30) + (Math.random() - 0.5) * 0.05),
        content: Math.max(0.01, (baseCost * 0.28) + (Math.random() - 0.5) * 0.06),
        outreach: Math.max(0.01, (baseCost * 0.15) + (Math.random() - 0.5) * 0.03),
        research: Math.max(0.01, (baseCost * 0.20) + (Math.random() - 0.5) * 0.05),
        ops: Math.max(0.005, (baseCost * 0.07) + (Math.random() - 0.5) * 0.02),
      },
      byModel: {
        'claude-sonnet-4-20250514': Math.max(0.01, baseCost * 0.55),
        'claude-haiku-3.5': Math.max(0.005, baseCost * 0.10),
        'gpt-4o': Math.max(0.01, baseCost * 0.25),
        'gpt-4o-mini': Math.max(0.002, baseCost * 0.05),
        'deepseek-r1': Math.max(0.002, baseCost * 0.05),
      },
    });
  }
  return days;
};

export const mockCostData = {
  creditBalance: 42.67,
  creditLimit: 100,
  dailyCosts: generateDailyCosts(),
  totalThisMonth: 11.23,
  totalLastMonth: 9.87,
  avgDailyCost: 0.37,
  topModels: [
    { name: 'claude-sonnet-4-20250514', totalCost: 6.18, totalTokens: 412000, requests: 284, pct: 55 },
    { name: 'gpt-4o', totalCost: 2.81, totalTokens: 187000, requests: 126, pct: 25 },
    { name: 'claude-haiku-3.5', totalCost: 1.12, totalTokens: 896000, requests: 518, pct: 10 },
    { name: 'gpt-4o-mini', totalCost: 0.56, totalTokens: 373000, requests: 247, pct: 5 },
    { name: 'deepseek-r1', totalCost: 0.56, totalTokens: 255000, requests: 89, pct: 5 },
  ],
};

// ─── Agent Stats ────────────────────────────────────────────────

export const mockAgentStats = [
  {
    id: 'jerry', name: 'Jerry Baker', role: 'Chief of Staff', emoji: '🧠',
    status: 'active', lastActive: ago(12),
    tasksToday: 4, tasksCompleted: 2, tasksFailed: 0,
    tokensToday: 15500, costToday: 0.148,
    costThisWeek: 0.92, costThisMonth: 3.41,
    uptime: 98.5, avgTaskDuration: 420,
    topTools: ['todoist', 'slack', 'notion', 'grain'],
    recentTasks: ['Morning standup', 'Client prep', 'Weekly metrics'],
  },
  {
    id: 'content', name: 'Content Team', role: 'Content Pipeline', emoji: '✍️',
    status: 'active', lastActive: ago(8),
    tasksToday: 3, tasksCompleted: 1, tasksFailed: 0,
    tokensToday: 23500, costToday: 0.195,
    costThisWeek: 1.08, costThisMonth: 3.15,
    uptime: 97.2, avgTaskDuration: 540,
    topTools: ['buffer', 'contentstudio', 'google-drive', 'rise-visuals'],
    recentTasks: ['LinkedIn post', 'YouTube script', 'Newsletter draft'],
  },
  {
    id: 'outreach', name: 'Outreach Agent', role: 'Lead Gen & Podcast', emoji: '📧',
    status: 'idle', lastActive: ago(22),
    tasksToday: 2, tasksCompleted: 1, tasksFailed: 0,
    tokensToday: 12300, costToday: 0.006,
    costThisWeek: 0.42, costThisMonth: 1.68,
    uptime: 99.1, avgTaskDuration: 360,
    topTools: ['instantly', 'podengine', 'hunter', 'unipile'],
    recentTasks: ['Podcast outreach batch', 'Follow-up campaign', 'Lead import'],
  },
  {
    id: 'research', name: 'Research Agent', role: 'Market Intel', emoji: '🔍',
    status: 'idle', lastActive: ago(95),
    tasksToday: 2, tasksCompleted: 1, tasksFailed: 1,
    tokensToday: 15400, costToday: 0.109,
    costThisWeek: 0.76, costThisMonth: 2.24,
    uptime: 94.8, avgTaskDuration: 480,
    topTools: ['perplexity', 'google-drive', 'hunter'],
    recentTasks: ['Competitor analysis', 'Lead qualification', 'AI news digest'],
  },
  {
    id: 'ops', name: 'Ops Agent', role: 'Automation & Infra', emoji: '⚙️',
    status: 'idle', lastActive: ago(165),
    tasksToday: 1, tasksCompleted: 1, tasksFailed: 0,
    tokensToday: 2900, costToday: 0.001,
    costThisWeek: 0.15, costThisMonth: 0.75,
    uptime: 99.8, avgTaskDuration: 180,
    topTools: ['make', 'notion', 'google-drive'],
    recentTasks: ['Make.com health check', 'Notion sync', 'Backup verification'],
  },
];

// ─── Recent Activity Feed ───────────────────────────────────────

export const mockRecentActivity = [
  { id: 'act_01', time: ago(2), agent: 'jerry', type: 'task_start', message: 'Started morning standup briefing' },
  { id: 'act_02', time: ago(5), agent: 'content', type: 'task_start', message: 'Started drafting LinkedIn post' },
  { id: 'act_03', time: ago(8), agent: 'jerry', type: 'tool_call', message: 'Called Todoist → fetched 12 tasks for today' },
  { id: 'act_04', time: ago(12), agent: 'content', type: 'tool_call', message: 'Called Buffer → checked posting schedule' },
  { id: 'act_05', time: ago(22), agent: 'outreach', type: 'task_complete', message: 'Completed podcast outreach — 15 emails sent' },
  { id: 'act_06', time: ago(35), agent: 'outreach', type: 'tool_call', message: 'Called Instantly → imported 15 new leads' },
  { id: 'act_07', time: ago(45), agent: 'outreach', type: 'task_start', message: 'Started podcast host outreach batch 12' },
  { id: 'act_08', time: ago(85), agent: 'research', type: 'task_fail', message: 'Lead qualification failed — Hunter.io rate limit' },
  { id: 'act_09', time: ago(95), agent: 'research', type: 'task_complete', message: 'Completed competitor analysis — Q1 landscape' },
  { id: 'act_10', time: ago(120), agent: 'research', type: 'task_start', message: 'Started competitor analysis research' },
  { id: 'act_11', time: ago(165), agent: 'ops', type: 'task_complete', message: 'Make.com health check — all 14 scenarios green' },
  { id: 'act_12', time: ago(180), agent: 'ops', type: 'task_start', message: 'Started Make.com scenario health check' },
];

// ─── Session Logs ───────────────────────────────────────────────

export const mockSessionLogs = {
  ses_001: [
    { ts: ago(12), level: 'info', message: 'Session started — Morning standup briefing' },
    { ts: ago(11), level: 'info', message: 'Tool call: todoist.find-tasks-by-date → 12 tasks' },
    { ts: ago(10), level: 'info', message: 'Tool call: grain.list_attended_meetings → 3 meetings today' },
    { ts: ago(9), level: 'info', message: 'Tool call: slack.search_public → checking #general for updates' },
    { ts: ago(8), level: 'debug', message: 'Compiling priority matrix — 4 high, 5 medium, 3 low' },
    { ts: ago(7), level: 'info', message: 'Tool call: slack.send_message → posted daily briefing' },
    { ts: ago(5), level: 'info', message: 'Delegating tasks to agents...' },
    { ts: ago(4), level: 'info', message: 'Assigned content task → Content Team' },
    { ts: ago(3), level: 'info', message: 'Assigned outreach task → Outreach Agent' },
    { ts: ago(2), level: 'info', message: 'Model usage: 4,200 in / 1,850 out tokens (Sonnet 4)' },
  ],
  ses_003: [
    { ts: ago(45), level: 'info', message: 'Session started — Podcast outreach batch 12' },
    { ts: ago(44), level: 'info', message: 'Tool call: podengine.search_podcasts → found 22 matches' },
    { ts: ago(42), level: 'info', message: 'Filtered to 15 high-fit hosts (score > 7.5)' },
    { ts: ago(40), level: 'info', message: 'Tool call: hunter.Email-Finder → resolved 15/15 emails' },
    { ts: ago(35), level: 'info', message: 'Tool call: instantly.add_leads_to_campaign_or_list_bulk → imported 15' },
    { ts: ago(30), level: 'info', message: 'Generating personalized email variants...' },
    { ts: ago(25), level: 'info', message: 'Tool call: instantly.activate_campaign → campaign live' },
    { ts: ago(22), level: 'info', message: 'Session completed — 15 outreach emails queued' },
  ],
};
