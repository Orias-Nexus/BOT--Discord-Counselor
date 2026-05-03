import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const STAT_CARDS = [
  { key: 'members', icon: 'group', label: 'Total Members', color: 'primary' },
  { key: 'messages', icon: 'forum', label: 'Messages Today', color: 'secondary' },
  { key: 'voice', icon: 'mic', label: 'Active in Voice', color: 'tertiary' },
  { key: 'boost', icon: 'rocket_launch', label: 'Server Boost', color: 'neutral' },
];

export default function Overview() {
  const { selectedServerId, user } = useAuth();
  const navigate = useNavigate();

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

  const userName = user?.username || user?.name || 'Admin';

  const statValues = [
    { value: info?.memberCount ?? stats.total_members ?? 0, trend: '+5.2%', up: true },
    { value: stats.messages_today ?? 0, trend: null, up: true },
    { value: info?.voiceCount ?? 0, trend: null, up: false },
    { value: `${info?.boostCount ?? 0} Boosts`, trend: `Level ${info?.boostTier ?? 0}`, up: null },
  ];

  // Resolve owner name from guild member list if available
  const ownerName = (() => {
    if (!info?.ownerId) return null;
    // Check top members for a match
    const ownerMember = top.find(m => m.user_id === info.ownerId);
    if (ownerMember) return ownerMember.display_name || ownerMember.username || null;
    return null;
  })();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-surface-container-highest rounded-2xl p-8 flex items-center justify-between ambient-shadow relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-display-lg text-on-surface mb-2">
            {getGreeting()}, {userName}!
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            Your server is thriving today. Here's what's happening across your community.
          </p>
        </div>
        <div className="relative z-10 flex gap-4">
          <button
            onClick={() => navigate('/embeds')}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl text-label-sm hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            Create Embed
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-6 py-3 rounded-xl text-label-sm hover:bg-tertiary-fixed-dim transition-colors cursor-pointer"
          >
            View Logs
          </button>
        </div>
        {/* Decorative blob */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl" />
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Block (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STAT_CARDS.map((card, i) => {
              const val = statValues[i];
              const bgMap = {
                primary: 'bg-primary-fixed',
                secondary: 'bg-secondary-fixed',
                tertiary: 'bg-tertiary-fixed',
                neutral: 'bg-surface-container-highest',
              };
              const textMap = {
                primary: 'text-primary',
                secondary: 'text-secondary',
                tertiary: 'text-tertiary',
                neutral: 'text-on-surface-variant',
              };
              return (
                <div key={card.key} className="bg-surface rounded-2xl p-6 ambient-shadow flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 ${bgMap[card.color]} rounded-xl`}>
                      <span className={`material-symbols-outlined ${textMap[card.color]}`}>
                        {card.icon}
                      </span>
                    </div>
                    {val.trend && (
                      <span className={`text-label-sm px-3 py-1 rounded-full flex items-center gap-1 ${
                        val.up === true
                          ? 'text-primary-container bg-primary-fixed'
                          : val.up === false
                          ? 'text-secondary bg-secondary-fixed'
                          : 'text-on-surface-variant bg-surface-variant'
                      }`}>
                        {val.up !== null && (
                          <span className="material-symbols-outlined text-[14px]">
                            {val.up ? 'trending_up' : 'trending_down'}
                          </span>
                        )}
                        {val.trend}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-body-md text-on-surface-variant mb-1">{card.label}</p>
                    <p className="text-headline-md text-on-surface">
                      {typeof val.value === 'number' ? val.value.toLocaleString() : val.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity Trends Chart */}
          <div className="bg-surface rounded-2xl p-8 ambient-shadow h-64 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md text-on-surface">Activity Trends</h3>
              <div className="flex items-center gap-4 text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-primary-fixed-dim/50 inline-block" /> Messages
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-secondary inline-block" /> Today
                </span>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-2 px-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const heights = [40, 60, 30, 80, 50, 70, 45];
                const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
                return (
                  <div key={day} className="w-full flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-lg transition-colors cursor-pointer relative group ${
                        isToday
                          ? 'bg-secondary/80 hover:bg-secondary'
                          : 'bg-primary-fixed-dim/30 hover:bg-primary-fixed-dim/50'
                      }`}
                      style={{ height: `${heights[i]}%` }}
                    >
                      {isToday && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Today
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-outline">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Top Members + Server Info */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl p-6 ambient-shadow h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md text-on-surface">Top Members</h3>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-label-sm text-primary hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-5">
              {top.length === 0 && (
                <p className="text-center text-sm text-on-surface-variant py-8">No data yet.</p>
              )}
              {top.map((m, i) => {
                const icons = ['emoji_events', 'military_tech', 'workspace_premium', 'star', 'trending_up'];
                const bgColors = ['bg-primary-fixed', 'bg-secondary-fixed', 'bg-tertiary-fixed', 'bg-surface-container-highest', 'bg-surface-container-highest'];
                const textColors = ['text-primary', 'text-secondary', 'text-tertiary', 'text-on-surface-variant', 'text-on-surface-variant'];
                const displayName = m.display_name || m.username || 'Unknown';
                return (
                  <div key={m.user_id} className="flex gap-4 items-start">
                    <div className={`h-10 w-10 rounded-full ${bgColors[i]} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                      {m.avatar ? (
                        <img
                          src={`https://cdn.discordapp.com/avatars/${m.user_id}/${m.avatar}.png`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className={`material-symbols-outlined text-[20px] ${textColors[i]}`}>
                          {icons[i]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-md text-on-surface truncate">
                        <span className="font-bold">{displayName}</span>
                      </p>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        Lv {m.member_level || 0} · {(m.member_exp || 0).toLocaleString()} XP
                      </p>
                    </div>
                    <span className="text-label-sm text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">
                      #{i + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Server Info */}
            {info && (
              <div className="mt-8 pt-6 border-t border-surface-variant">
                <h4 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Server Info</h4>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Name" value={info.name} />
                  <InfoRow label="Owner" value={ownerName || info.ownerTag || 'Server Owner'} />
                  <InfoRow label="Roles" value={info.roles?.length ?? 0} />
                  <InfoRow label="Channels" value={info.channels?.length ?? 0} />
                  <InfoRow label="Boost" value={`${info.boostCount ?? 0} boosts · Level ${info.boostTier ?? 0}`} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-on-surface">{value}</span>
    </div>
  );
}
