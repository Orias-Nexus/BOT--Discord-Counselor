import { useQuery } from '@tanstack/react-query';
import { Crown, Medal, Trophy, Globe, Users } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const rankIcon = (rank) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-amber-300" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-zinc-300" />;
  if (rank === 3) return <Trophy className="w-4 h-4 text-orange-300" />;
  return <span className="text-xs text-zinc-500 font-mono">#{rank}</span>;
};

export default function Leaderboard() {
  const { selectedServerId } = useAuth();
  const [scope, setScope] = useState('local');

  const localQuery = useQuery({
    queryKey: ['leaderboard', 'local', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/members/${selectedServerId}/leaderboard?limit=50`);
      return data;
    },
    enabled: scope === 'local' && Boolean(selectedServerId),
  });

  const globalQuery = useQuery({
    queryKey: ['leaderboard', 'global'],
    queryFn: async () => {
      const { data } = await api.get('/leaderboard/global?limit=50');
      return data;
    },
    enabled: scope === 'global',
  });

  const active = scope === 'local' ? localQuery : globalQuery;
  const rows = active.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Leaderboard</h1>
          <p className="text-zinc-400">Top EXP — local trong server hoặc global toàn network.</p>
        </div>
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setScope('local')}
            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium ${
              scope === 'local' ? 'bg-indigo-500 text-white' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Local
          </button>
          <button
            type="button"
            onClick={() => setScope('global')}
            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium ${
              scope === 'global' ? 'bg-indigo-500 text-white' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> Global
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/70 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-6 py-3 text-left w-20">Rank</th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-right">Level</th>
              <th className="px-6 py-3 text-right">EXP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {active.isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">Đang tải...</td>
              </tr>
            )}
            {!active.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">Chưa có dữ liệu.</td>
              </tr>
            )}
            {rows.map((row, i) => {
              const rank = i + 1;
              const name = row.username || row.user_name || row.user_id || 'Unknown';
              const level = row.member_level ?? row.user_level ?? 0;
              const exp = row.member_exp ?? row.user_exp ?? 0;
              return (
                <tr key={row.user_id || i} className="hover:bg-white/5">
                  <td className="px-6 py-3">{rankIcon(rank)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-indigo-300 overflow-hidden">
                        {row.avatar && row.user_id ? (
                          <img src={`https://cdn.discordapp.com/avatars/${row.user_id}/${row.avatar}.png?size=64`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          String(name).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-white">{name}</p>
                        <p className="text-[10px] font-mono text-zinc-500">{row.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-mono">{level}</td>
                  <td className="px-6 py-3 text-right font-mono">{exp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
