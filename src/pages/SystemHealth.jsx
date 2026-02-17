import { Activity, Wifi, WifiOff, Server, Radio, Shield, Clock } from 'lucide-react';
import { useGatewayHealth, useChannels } from '../hooks/useOpenClawAPI';
import PageHeader from '../components/layout/PageHeader';
import { SkeletonDashboard } from '../components/shared/Skeleton';
import EmptyState from '../components/shared/EmptyState';
import { formatDuration } from '../lib/formatters';

function StatusDot({ ok, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${ok ? 'bg-accent-green animate-pulse-green' : 'bg-accent-red'}`} />
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}

function GatewayCard({ health }) {
  if (!health) return null;

  const uptime = health.ts ? formatDuration((Date.now() - (health.ts - (health.durationMs || 0))) / 1000) : '—';

  return (
    <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${health.ok ? 'bg-accent-green/10' : 'bg-accent-red/10'}`}>
          <Server size={20} className={health.ok ? 'text-accent-green' : 'text-accent-red'} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-text-primary">Gateway</h2>
          <p className="text-xs text-text-muted">{health.ok ? 'Healthy' : 'Unhealthy'}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${health.ok ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
          {health.ok ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="px-5 py-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Default Agent</div>
          <div className="text-sm text-text-primary font-data">{health.defaultAgentId || '—'}</div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Heartbeat</div>
          <div className="text-sm text-text-primary font-data">{health.heartbeatSeconds ? `${health.heartbeatSeconds}s` : '—'}</div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Agents</div>
          <div className="text-sm text-text-primary font-data">{health.agents?.length || 0}</div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Probe Time</div>
          <div className="text-sm text-text-primary font-data">{health.durationMs ? `${health.durationMs}ms` : '—'}</div>
        </div>
      </div>
    </div>
  );
}

function ChannelCard({ id, label, channel }) {
  const isRunning = channel?.running === true;
  const isConfigured = channel?.configured === true;

  return (
    <div className={`bg-surface border rounded-lg p-4 transition-colors ${isRunning ? 'border-accent-green/30' : 'border-border-default'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRunning ? 'bg-accent-green/10' : 'bg-elevated'}`}>
          {isRunning ? <Wifi size={16} className="text-accent-green" /> : <WifiOff size={16} className="text-text-muted" />}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary capitalize">{label || id}</h3>
          <p className="text-[10px] text-text-muted">
            {isRunning ? `Running (${channel.mode || 'active'})` : isConfigured ? 'Configured but not running' : 'Not configured'}
          </p>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-accent-green animate-pulse-green' : isConfigured ? 'bg-accent-yellow' : 'bg-gray-600'}`} />
      </div>
      <div className="space-y-1.5 text-xs">
        {channel?.tokenSource && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Token source</span>
            <span className="text-text-secondary font-data">{channel.tokenSource}</span>
          </div>
        )}
        {channel?.mode && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Mode</span>
            <span className="text-text-secondary font-data">{channel.mode}</span>
          </div>
        )}
        {channel?.lastStartAt && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Started</span>
            <span className="text-text-secondary font-data">
              {new Date(channel.lastStartAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        {channel?.lastError && (
          <div className="mt-2 px-2 py-1.5 bg-accent-red/5 border border-accent-red/20 rounded text-accent-red text-[10px]">
            {channel.lastError}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentHealthRow({ agent }) {
  const sessionCount = agent.sessions?.count || 0;
  const hasHeartbeat = agent.heartbeat?.enabled;
  const recentActivity = agent.sessions?.recent?.[0];

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-elevated/50 transition-colors">
      <span className={`w-2 h-2 rounded-full shrink-0 ${sessionCount > 0 ? 'bg-accent-green' : 'bg-gray-600'}`} />
      <span className="text-sm text-text-primary flex-1 truncate">{agent.name || agent.agentId}</span>
      <span className="text-xs text-text-muted font-data w-12 text-right">{sessionCount} sess</span>
      {hasHeartbeat && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue">{agent.heartbeat.every}</span>
      )}
      {recentActivity && (
        <span className="text-xs text-text-muted font-data w-20 text-right">
          {recentActivity.age < 60000 ? 'now' :
           recentActivity.age < 3600000 ? `${Math.round(recentActivity.age / 60000)}m ago` :
           `${Math.round(recentActivity.age / 3600000)}h ago`}
        </span>
      )}
    </div>
  );
}

export default function SystemHealth() {
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useGatewayHealth();
  const { data: channelData, isLoading: channelsLoading } = useChannels();

  const isLoading = healthLoading || channelsLoading;

  if (isLoading) return (
    <div className="space-y-4">
      <PageHeader title="System Health" subtitle="Loading…" />
      <SkeletonDashboard />
    </div>
  );

  const channels = channelData?.channels || {};
  const channelLabels = channelData?.channelLabels || {};

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="System Health"
        subtitle="Gateway, channels, and agent connectivity"
        onRefresh={refetchHealth}
      />

      {/* Gateway Status */}
      <GatewayCard health={health} />

      {/* Channels */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Radio size={14} className="text-text-muted" /> Channels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(channels).length === 0 ? (
            <EmptyState icon={WifiOff} title="No channels configured" subtitle="Add channels via openclaw channels add" />
          ) : (
            Object.entries(channels).map(([id, channel]) => (
              <ChannelCard key={id} id={id} label={channelLabels[id] || id} channel={channel} />
            ))
          )}
        </div>
      </div>

      {/* Agent Fleet Health */}
      {health?.agents && health.agents.length > 0 && (
        <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Shield size={14} className="text-text-muted" /> Agent Fleet Health
            </h2>
            <span className="text-xs text-text-muted font-data">{health.agents.length} agents</span>
          </div>
          <div className="divide-y divide-border-default max-h-96 overflow-y-auto">
            {health.agents
              .sort((a, b) => (b.sessions?.count || 0) - (a.sessions?.count || 0))
              .map((agent) => (
                <AgentHealthRow key={agent.agentId} agent={agent} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
