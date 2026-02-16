import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Play, Pause, Search, RefreshCw, ArrowUpDown, Timer, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useCronList, useRunCron, useToggleCron } from '../hooks/useOpenClaw';
import { cronToHuman, timeAgo, formatDuration, cn } from '../lib/utils';

export default function TaskQueue() {
  const { data: cronData, isLoading, refetch } = useCronList();
  const runCron = useRunCron();
  const toggleCron = useToggleCron();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  const jobs = cronData?.jobs || [];

  const columns = useMemo(() => [
    {
      accessorKey: 'enabled',
      header: 'Status',
      size: 80,
      cell: ({ getValue }) => {
        const enabled = getValue();
        return (
          <div className="flex items-center gap-1.5">
            <div className={cn(
              'w-2 h-2 rounded-full',
              enabled ? 'bg-neon-green pulse-dot' : 'bg-jerry-500'
            )} />
            <span className={cn('text-xs font-medium', enabled ? 'text-neon-green' : 'text-jerry-500')}>
              {enabled ? 'Active' : 'Off'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Job Name',
      size: 250,
      cell: ({ getValue, row }) => (
        <div>
          <div className="text-sm font-medium text-white truncate max-w-[240px]">
            {getValue() || row.original.id.slice(0, 12)}
          </div>
          {row.original.agentId && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-purple/10 text-neon-purple mt-0.5 inline-block">
              {row.original.agentId}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'schedule',
      header: 'Schedule',
      size: 180,
      cell: ({ getValue }) => {
        const sched = getValue();
        return (
          <div>
            <div className="text-xs text-jerry-300">{cronToHuman(sched?.expr)}</div>
            <div className="text-[10px] text-jerry-500 font-mono">{sched?.expr}</div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.state?.nextRunAtMs || Infinity;
        const b = rowB.original.state?.nextRunAtMs || Infinity;
        return a - b;
      },
    },
    {
      accessorKey: 'state',
      header: 'Next Run',
      size: 150,
      cell: ({ getValue }) => {
        const state = getValue();
        if (!state?.nextRunAtMs) return <span className="text-jerry-500 text-xs">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <Timer size={12} className="text-neon-cyan" />
            <span className="text-xs text-jerry-300">{timeAgo(state.nextRunAtMs)}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.state?.nextRunAtMs || Infinity;
        const b = rowB.original.state?.nextRunAtMs || Infinity;
        return a - b;
      },
    },
    {
      id: 'lastRun',
      header: 'Last Run',
      size: 150,
      cell: ({ row }) => {
        const state = row.original.state;
        if (!state?.lastRunAtMs) return <span className="text-jerry-500 text-xs">Never</span>;
        const hasError = state.consecutiveErrors > 0;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              {hasError
                ? <AlertTriangle size={12} className="text-neon-red" />
                : <CheckCircle2 size={12} className="text-neon-green" />
              }
              <span className="text-xs text-jerry-300">{timeAgo(state.lastRunAtMs)}</span>
            </div>
            {state.lastDurationMs && (
              <span className="text-[10px] text-jerry-500">{formatDuration(state.lastDurationMs)}</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 120,
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => runCron.mutate(job.id)}
              disabled={runCron.isPending}
              className="px-2 py-1 rounded text-[11px] font-medium bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
              title="Run now"
            >
              <Play size={12} />
            </button>
            <button
              onClick={() => toggleCron.mutate({ id: job.id, enabled: !job.enabled })}
              disabled={toggleCron.isPending}
              className={cn(
                'px-2 py-1 rounded text-[11px] font-medium transition-colors disabled:opacity-50',
                job.enabled
                  ? 'bg-neon-orange/10 text-neon-orange hover:bg-neon-orange/20'
                  : 'bg-neon-green/10 text-neon-green hover:bg-neon-green/20'
              )}
              title={job.enabled ? 'Disable' : 'Enable'}
            >
              {job.enabled ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        );
      },
    },
  ], [runCron, toggleCron]);

  const table = useReactTable({
    data: jobs,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const name = row.original.name || '';
      const agent = row.original.agentId || '';
      const search = filterValue.toLowerCase();
      return name.toLowerCase().includes(search) || agent.toLowerCase().includes(search);
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Timer className="text-neon-purple" size={24} />
            Task Queue
          </h2>
          <p className="text-sm text-jerry-400 mt-1">
            {jobs.length} cron jobs • {jobs.filter(j => j.enabled).length} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-jerry-500" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search jobs..."
              className="pl-9 pr-3 py-2 rounded-lg bg-jerry-800/50 border border-jerry-600/30 text-sm text-white placeholder-jerry-500 focus:outline-none focus:border-neon-purple/50 w-60"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-jerry-700/50 text-jerry-300 hover:text-white hover:bg-jerry-600/50 transition-all text-sm"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-jerry-600/30">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-jerry-400 uppercase tracking-wider cursor-pointer hover:text-jerry-200 select-none"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={10} className="text-jerry-600" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-jerry-500">
                    Loading cron jobs...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-jerry-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-jerry-700/20 hover:bg-jerry-800/30 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run mutation feedback */}
      {runCron.isSuccess && (
        <div className="fixed bottom-6 right-6 bg-neon-green/10 border border-neon-green/30 text-neon-green px-4 py-2 rounded-lg text-sm">
          ✓ Job triggered successfully
        </div>
      )}
    </div>
  );
}
