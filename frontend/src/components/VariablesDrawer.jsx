import { useEffect, useMemo, useState } from 'react';
import { HelpCircle, Search, X, Copy } from 'lucide-react';
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
      <button
        type="button"
        aria-label="Variables"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-70 w-12 h-12 rounded-full bg-primary text-on-primary shadow-[0_10px_30px_rgba(218,185,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {open && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-70 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed top-0 right-0 bottom-0 z-80 w-full sm:w-[420px] bg-surface-container-lowest border-l border-white/5 shadow-2xl flex flex-col">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Available Variables</h3>
                <p className="text-xs text-slate-400 mt-1">Use these inside embeds & messages.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-surface-container-low border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {isLoading && (
                <p className="text-center text-slate-500 text-sm py-8">Loading variables...</p>
              )}
              {!isLoading && grouped.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-8">No variables found.</p>
              )}
              {grouped.map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">{category}</h4>
                  <ul className="space-y-1">
                    {items.map((v) => (
                      <li
                        key={v.key}
                        className="group flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => copy(`{${v.key}}`)}
                            className="text-left font-mono text-sm text-primary hover:underline truncate block w-full"
                            title="Click to copy"
                          >
                            {'{' + v.key + '}'}
                          </button>
                          {v.description && (
                            <p className="text-xs text-slate-400 mt-0.5">{v.description}</p>
                          )}
                          {v.example && (
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">e.g. {v.example}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => copy(`{${v.key}}`)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                          aria-label="Copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
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
