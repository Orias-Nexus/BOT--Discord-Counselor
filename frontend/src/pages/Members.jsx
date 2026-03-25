import { useState, useEffect } from 'react';
import { Search, UserCheck, AlertTriangle, ShieldOff, Lock } from 'lucide-react';

export default function Members() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Member Directory</h1>
          <p className="text-zinc-400">Search, manage, and moderate users across the server.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by username or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">Level</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder rows */}
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                      O
                    </div>
                    <div>
                      <div className="font-medium text-white">Orias1701</div>
                      <div className="text-xs text-zinc-500 font-mono">123456789012345678</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-300">Level 42</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    <UserCheck className="w-3.5 h-3.5" /> Good
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Manage</button>
                </td>
              </tr>
              
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold border border-rose-500/30">
                      B
                    </div>
                    <div>
                      <div className="font-medium text-white">BadActor</div>
                      <div className="text-xs text-zinc-500 font-mono">987654321098765432</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-300">Level 2</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> Warning
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Manage</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
