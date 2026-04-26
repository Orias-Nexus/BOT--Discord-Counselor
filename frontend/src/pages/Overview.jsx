import { useQuery } from '@tanstack/react-query';
import { Users, Diamond, Hash, Activity, Crown } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
        <Icon className="w-4 h-4 text-indigo-300" />
      </div>
      <p className="mt-3 text-3xl font-bold text-white tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export default function Overview() {
  const { selectedServerId } = useAuth();

  const statsQuery = useQuery({
    queryKey: ['stats', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}/stats`);
      return data;
    },
    enabled: Boolean(selectedServerId),
  });

  const infoQuery = useQuery({
    queryKey: ['discord-info', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}/discord-info`);
      return data;
    },
    enabled: Boolean(selectedServerId),
    retry: false,
  });

  const topQuery = useQuery({
    queryKey: ['members', selectedServerId, 'top5'],
    queryFn: async () => {
      const { data } = await api.get(`/members/${selectedServerId}/leaderboard?limit=5`);
      return data;
    },
    enabled: Boolean(selectedServerId),
  });

  const stats = statsQuery.data ?? {};
  const info = infoQuery.data;
  const top = topQuery.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Overview</h1>
        <p className="text-zinc-400">Snapshot live của server.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Members" value={info?.memberCount ?? stats.total_members ?? 0} hint="Discord cache" />
        <Stat icon={Diamond} label="Tier" value={stats.status || 'Standard'} hint={`Boost tier ${info?.boostTier ?? 0}`} />
        <Stat icon={Hash} label="Channels" value={(info?.channels?.length ?? stats.configured_channels ?? 0)} />
        <Stat icon={Activity} label="Managed" value={stats.configured_channels ?? 0} hint="Dashboard-controlled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4 text-white flex items-center gap-2">
            <Crown className="w-4 h-4 text-indigo-300" /> Top 5 Members
          </h2>
          <ul className="divide-y divide-zinc-800">
            {top.length === 0 && <li className="py-4 text-center text-sm text-zinc-500">Chưa có data.</li>}
            {top.map((m, i) => (
              <li key={m.user_id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs text-zinc-500 font-mono">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {m.avatar ? (
                      <img src={`https://cdn.discordapp.com/avatars/${m.user_id}/${m.avatar}.png`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-indigo-300">{(m.username || 'U').charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm">{m.username || m.user_id}</p>
                    <p className="text-xs text-zinc-500 font-mono">Lv {m.member_level || 0}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{m.member_exp || 0} exp</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-white">Server Info</h2>
          {info ? (
            <div className="text-sm space-y-2">
              <Row label="Name" value={info.name} />
              <Row label="Guild ID" value={<span className="font-mono text-xs text-zinc-400">{info.id}</span>} />
              <Row label="Owner" value={<span className="font-mono text-xs text-zinc-400">{info.ownerId}</span>} />
              <Row label="Roles" value={info.roles?.length ?? 0} />
              <Row label="Categories" value={info.categories?.length ?? 0} />
              <Row label="Boost" value={`${info.boostCount ?? 0} boosts · tier ${info.boostTier ?? 0}`} />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Bot chưa sẵn sàng hoặc đang offline.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  );
}
