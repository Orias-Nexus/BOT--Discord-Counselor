import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import api from '../utils/api';

export default function VariablesDrawer() {
  const [open, setOpen] = useState(false);
  const [variables, setVariables] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || variables.length > 0) return;
    setIsLoading(true);
    api.get('/variables')
      .then((res) => setVariables(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVariables([]))
      .finally(() => setIsLoading(false));
  }, [open, variables.length]);

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? variables.filter((v) =>
          v.key.toLowerCase().includes(q) ||
          (v.description || '').toLowerCase().includes(q)
        )
      : variables;
    const groups = new Map();
    for (const v of filtered) {
      const cat = v.category || 'General';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(v);
    }
    return [...groups.entries()];
  }, [variables, search]);

  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Copied: ${value}`);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        type="button"
        aria-label="Variables"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-70 w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        <span className="material-symbols-outlined">help</span>
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            role="presentation"
            className="fixed inset-0 z-70 bg-on-surface/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed top-0 right-0 bottom-0 z-80 w-full sm:w-[420px] bg-surface-container-lowest border-l border-sidebar-border shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
              <div>
                <h3 className="text-headline-md text-on-surface">Variables</h3>
                <p className="text-xs text-on-surface-variant mt-1">Use these inside embeds & messages.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search variables..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-10 pr-3 py-2.5 text-sm text-on-surface placeholder-outline-variant focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {isLoading && (
                <p className="text-center text-on-surface-variant text-sm py-8">Loading variables...</p>
              )}
              {!isLoading && grouped.length === 0 && (
                <p className="text-center text-on-surface-variant text-sm py-8">No variables found.</p>
              )}
              {grouped.map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-3">
                    {category}
                  </h4>
                  <ul className="space-y-1">
                    {items.map((v) => (
                      <li
                        key={v.key}
                        className="group flex items-start gap-2 p-3 rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
                        onClick={() => copy(`{${v.key}}`)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm text-primary truncate">
                            {'{' + v.key + '}'}
                          </p>
                          {v.description && (
                            <p className="text-xs text-on-surface-variant mt-0.5">{v.description}</p>
                          )}
                          {v.example && (
                            <p className="text-[10px] text-outline mt-0.5 font-mono">e.g. {v.example}</p>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity text-sm mt-0.5">
                          content_copy
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
