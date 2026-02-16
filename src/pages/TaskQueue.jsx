import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter } from 'lucide-react';
import { useTaskQueue } from '../hooks/useOpenClawAPI';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { formatDollars, formatTokens, formatRelativeTime } from '../lib/formatters';
import { AGENTS } from '../lib/constants';

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const priorityColors = {
  critical: 'text-accent-red',
  high: 'text-accent-yellow',
  medium: 'text-accent-blue',
  low: 'text-text-muted',
};

export default function TaskQueue() {
  const { data: tasks, isLoading, error, refetch } = useTaskQueue();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (!tasks) return [];
    if (statusFilter === 'all') return tasks;
    return tasks.filter(t => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const columns = useMemo(() => [
    {
      accessorKey: 'priority',
      header: 'Priority',
      size: 80,
      cell: ({ getValue }) => {
        const p = getValue();
        return (
          <span className={`text-xs font-medium uppercase ${priorityColors[p] || 'text-text-muted'}`}>
            {p}
          </span>
        );
      },
      sortingFn: (a, b) => {
        return (priorityOrder[a.getValue('priority')] ?? 99) - (priorityOrder[b.getValue('priority')] ?? 99);
      },
    },
    {
      accessorKey: 'title',
      header: 'Task',
      size: 280,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm text-text-primary truncate">{row.original.title}</p>
          {row.original.description && (
            <p className="text-xs text-text-muted truncate mt-0.5">{row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'agentName',
      header: 'Agent',
      size: 140,
      cell: ({ row }) => {
        const agent = Object.values(AGENTS).find(a => a.id === row.original.agent);
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs">{agent?.emoji || '🤖'}</span>
            <span className="text-sm text-text-secondary">{row.original.agentName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 110,
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      size: 100,
      cell: ({ getValue }) => (
        <span className="text-xs px-2 py-0.5 rounded bg-elevated text-text-muted">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'model',
      header: 'Model',
      size: 120,
      cell: ({ getValue }) => (
        <span className="text-xs text-text-secondary font-data">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'tokensUsed',
      header: 'Tokens',
      size: 80,
      cell: ({ getValue }) => (
        <span className="text-xs text-text-secondary font-data">{formatTokens(getValue())}</span>
      ),
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      size: 70,
      cell: ({ getValue }) => (
        <span className="text-xs text-text-secondary font-data">${formatDollars(getValue())}</span>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-accent-red p-4">Error loading tasks: {error.message}</div>;

  const statuses = ['all', 'queued', 'running', 'completed', 'failed', 'waiting'];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Task Queue"
        subtitle={`${tasks.length} tasks across all agents`}
        onRefresh={refetch}
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border-default rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border-default rounded-md p-0.5">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="border-b border-border-default">
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary select-none"
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp size={12} />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-30" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border-default">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-elevated/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted text-sm">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border-default px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {table.getRowModel().rows.length} of {tasks.length} tasks
          </span>
        </div>
      </div>
    </div>
  );
}
