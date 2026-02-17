import { useState, useCallback } from 'react';
import { Brain, Search, FileText, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useMemorySearch } from '../hooks/useOpenClawAPI';
import { fetchMemoryContent } from '../lib/api';
import PageHeader from '../components/layout/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import { CopyValue } from '../components/shared/CopyButton';

function useMemoryContent(filePath) {
  return useQuery({
    queryKey: ['memory-content', filePath],
    queryFn: () => fetchMemoryContent(filePath),
    enabled: !!filePath,
  });
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  const timeoutRef = { current: null };

  const update = useCallback((val) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebounced(val), delay);
  }, [delay]);

  if (value !== debounced && !timeoutRef.current) {
    update(value);
  }

  return debounced;
}

function MemoryContentViewer({ path: filePath }) {
  const { data, isLoading } = useMemoryContent(filePath);

  if (isLoading) {
    return (
      <div className="bg-surface border border-border-default rounded-lg p-6">
        <div className="animate-skeleton-pulse bg-elevated rounded h-4 w-48 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-skeleton-pulse bg-elevated rounded h-3" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.content) {
    return (
      <EmptyState
        icon={FileText}
        title="Could not load file"
        subtitle={data?.error || 'File not found'}
      />
    );
  }

  return (
    <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default bg-elevated/30">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-text-muted" />
          <span className="text-xs text-text-secondary font-data">{filePath}</span>
        </div>
        <CopyValue text={data.content} display="Copy all" mono={false} />
      </div>
      <pre className="p-4 text-sm text-text-secondary font-mono leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[600px]">
        {data.content}
      </pre>
    </div>
  );
}

export default function MemoryBrowser() {
  const [query, setQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState(null);
  const debouncedQuery = useDebounce(query, 400);
  const { data: results = [], isLoading, isFetching } = useMemorySearch(debouncedQuery);

  return (
    <div className="page-enter space-y-4">
      <PageHeader
        title="Memory Browser"
        subtitle="Search agent memory and knowledge base"
      />

      {/* Search Bar — large and prominent */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memories... (MEMORY.md, daily notes, brain)"
          className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border-default rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
          aria-label="Search memories"
          autoFocus
        />
        {isFetching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '400px' }}>
        {/* Results List */}
        <div className="bg-surface border border-border-default rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-border-default">
            <p className="text-xs text-text-muted">
              {query.length < 2 ? 'Type to search' : isLoading ? 'Searching...' : `${results.length} results`}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border-default">
            {query.length >= 2 && results.length === 0 && !isLoading && (
              <EmptyState
                icon={Brain}
                title="No memories found"
                subtitle={`No results for "${query}"`}
              />
            )}
            {results.map((result, i) => (
              <button
                key={result.key || i}
                type="button"
                className={`w-full text-left px-4 py-3 hover:bg-elevated/50 transition-colors ${
                  selectedPath === (result.source || result.key) ? 'bg-accent-blue/10 border-l-2 border-l-accent-blue' : 'border-l-2 border-l-transparent'
                }`}
                onClick={() => setSelectedPath(result.source || result.key)}
              >
                <p className="text-sm text-text-primary truncate">{result.key || result.title || 'Memory entry'}</p>
                {result.snippet && (
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{result.snippet}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  {result.source && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-elevated text-text-muted">{result.source}</span>
                  )}
                  {result.score != null && (
                    <span className="text-[10px] text-text-muted font-data">score: {result.score.toFixed(2)}</span>
                  )}
                  {result.timestamp && (
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock size={9} /> {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-2">
          {selectedPath ? (
            <MemoryContentViewer path={selectedPath} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Brain size={32} className="mx-auto text-text-muted mb-3" />
                <p className="text-sm text-text-muted">Search and select a memory to view its contents</p>
                <p className="text-xs text-text-muted mt-1">Searches MEMORY.md, daily notes, and brain directory</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
