import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, Lock, ShieldOff, UserCheck, X, Search } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import useJobUpdates from '../hooks/useJobUpdates';

const STATUS_META = {
  Good:   { label: 'Good', icon: UserCheck, className: 'bg-emerald-500/10 text-emerald-400' },
  Newbie: { label: 'Newbie', icon: UserCheck, className: 'bg-indigo-500/10 text-indigo-400' },
  Warn:   { label: 'Warn', icon: AlertTriangle, className: 'bg-amber-500/10 text-amber-400' },
  Mute:   { label: 'Mute', icon: ShieldOff, className: 'bg-rose-500/10 text-rose-400' },
  Lock:   { label: 'Lock', icon: Lock, className: 'bg-zinc-500/10 text-zinc-400' },
  Kick:   { label: 'Kick', icon: X, className: 'bg-red-500/10 text-red-500' },
  Leaved: { label: 'Leaved', icon: X, className: 'bg-red-500/10 text-red-400' },
};

const ACTIONS = [
  { key: 'warn', label: 'Warn', tone: 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' },
  { key: 'mute', label: 'Mute', tone: 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20' },
  { key: 'lock', label: 'Lock', tone: 'bg-zinc-500/10 text-zinc-200 hover:bg-zinc-500/20' },
  { key: 'reset', label: 'Reset', tone: 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20' },
  { key: 'kick', label: 'Kick', tone: 'bg-red-500/10 text-red-300 hover:bg-red-500/20' },
];

export default function Members() {
  const { selectedServerId } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/members/${selectedServerId}/leaderboard?limit=100`);
      return data;
    },
    enabled: Boolean(selectedServerId),
  });

  useJobUpdates((job) => {
    if (job?.status === 'completed') qc.invalidateQueries({ queryKey: ['members', selectedServerId] });
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      (m.username || '').toLowerCase().includes(q) ||
      (m.user_id || '').includes(q) ||
      (m.member_status || '').toLowerCase().includes(q)
    );
  }, [members, search]);

  const runAction = async (userId, action) => {
    try {
      await api.post(`/members/${selectedServerId}/${userId}/action`, { action });
      toast.success(`${action} queued for ${userId.slice(-4)}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Member Directory</h1>
          <p className="text-zinc-400">Quản lý status + moderation thông qua BullMQ.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username / ID..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/70 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-right">Level</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-500">Đang tải...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-500">Không có member nào.</td></tr>
            )}
            {filtered.map((m) => {
              const meta = STATUS_META[m.member_status] || { label: m.member_status || 'Newbie', icon: UserCheck, className: 'bg-indigo-500/10 text-indigo-400' };
              const Icon = meta.icon;
              return (
                <tr key={m.user_id} className="hover:bg-white/5">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {m.avatar ? (
                          <img src={`https://cdn.discordapp.com/avatars/${m.user_id}/${m.avatar}.png?size=64`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-indigo-300">{String(m.username || 'U').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white">{m.username || 'Unknown'}</p>
                        <p className="text-xs text-zinc-500 font-mono">{m.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-zinc-300">Lv {m.member_level || 0}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${meta.className}`}>
                      <Icon className="w-3.5 h-3.5" /> {meta.label}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="inline-flex flex-wrap gap-1 justify-end">
                      {ACTIONS.map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          onClick={() => runAction(m.user_id, a.key)}
                          className={`px-2 py-1 rounded text-[11px] font-medium ${a.tone}`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
