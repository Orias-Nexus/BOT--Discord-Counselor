import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

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
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-lg text-on-surface mb-2">Leaderboard</h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Recognizing our most active and engaged community members. Keep participating to climb the ranks.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScope('local')}
            className={`px-4 py-2 rounded-full text-sm text-label-sm transition-colors ${
              scope === 'local'
                ? 'bg-surface-variant text-on-surface-variant'
                : 'bg-transparent text-outline hover:bg-surface-container-low'
            }`}
          >
            This Server
          </button>
          <button
            type="button"
            onClick={() => setScope('global')}
            className={`px-4 py-2 rounded-full text-sm text-label-sm transition-colors ${
              scope === 'global'
                ? 'bg-surface-variant text-on-surface-variant'
                : 'bg-transparent text-outline hover:bg-surface-container-low'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Loading State */}
      {active.isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <p className="text-on-surface-variant">Loading leaderboard...</p>
        </div>
      )}

      {/* Empty State */}
      {!active.isLoading && rows.length === 0 && (
        <div className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">emoji_events</span>
          <p className="text-on-surface-variant">No leaderboard data yet.</p>
        </div>
      )}

      {/* Podium Section */}
      {!active.isLoading && top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end" style={{ minHeight: '400px' }}>
          {/* Rank 2 */}
          {top3[1] && <PodiumCard member={top3[1]} rank={2} height="80%" borderColor="border-secondary-container" />}
          {/* Rank 1 */}
          {top3[0] && <PodiumCard member={top3[0]} rank={1} height="100%" borderColor="border-primary" isFirst />}
          {/* Rank 3 */}
          {top3[2] && <PodiumCard member={top3[2]} rank={3} height="70%" borderColor="border-tertiary" />}
        </div>
      )}

      {/* List Rankings */}
      {!active.isLoading && rest.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-variant">
            <h3 className="text-headline-md text-on-surface">Community Rankings</h3>
          </div>
          <div className="flex flex-col gap-4">
            {rest.map((row, i) => {
              const rank = i + 4;
              const name = row.display_name || row.username || row.user_name || 'Unknown';
              const level = row.member_level ?? row.user_level ?? 0;
              const exp = row.member_exp ?? row.user_exp ?? 0;
              return (
                <div key={row.user_id || i} className="flex items-center gap-4 p-4 hover:bg-surface-bright rounded-xl transition-colors">
                  <div className="w-8 text-center font-bold text-outline">{rank}</div>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold flex-shrink-0">
                    {row.avatar && row.user_id ? (
                      <img src={`https://cdn.discordapp.com/avatars/${row.user_id}/${row.avatar}.png?size=64`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      String(name).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-on-surface truncate">{name}</h4>
                    <p className="text-xs text-outline">Lvl {level}</p>
                  </div>
                  <div className="w-48 hidden md:block">
                    <div className="w-full bg-surface-container-low rounded-full h-1.5 mb-1 shadow-sunken">
                      <div
                        className="bg-primary-container h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (exp / Math.max(1, exp + 500)) * 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-outline text-label-sm">
                      {exp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PodiumCard({ member, rank, height, borderColor, isFirst = false }) {
  const name = member.display_name || member.username || member.user_name || 'Unknown';
  const level = member.member_level ?? member.user_level ?? 0;
  const exp = member.member_exp ?? member.user_exp ?? 0;
  const avatarSize = isFirst ? 'w-32 h-32' : rank === 2 ? 'w-24 h-24' : 'w-20 h-20';
  const topOffset = isFirst ? '-top-16' : rank === 2 ? '-top-12' : '-top-10';
  const badgeSize = isFirst ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs';
  const badgeBg = isFirst ? 'bg-primary text-on-primary' : rank === 2 ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-tertiary text-on-tertiary';

  return (
    <div
      className={`bg-surface-container-lowest rounded-3xl ambient-shadow-lg p-6 flex flex-col items-center justify-end relative border-t-4 ${borderColor}`}
      style={{ height }}
    >
      <div className={`absolute ${topOffset}`}>
        <div className="relative">
          {isFirst && (
            <span
              className="material-symbols-outlined absolute -top-8 left-1/2 -translate-x-1/2 text-primary text-4xl drop-shadow-md"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
          )}
          <div className={`${avatarSize} rounded-full border-4 border-surface-container-lowest overflow-hidden shadow-md relative z-10 bg-surface-container-high flex items-center justify-center`}>
            {member.avatar && member.user_id ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${member.user_id}/${member.avatar}.png?size=128`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-on-surface-variant">
                {String(name).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className={`absolute bottom-0 right-0 ${badgeSize} ${badgeBg} rounded-full flex items-center justify-center font-bold border-2 border-white z-20 shadow-sm`}>
            {rank}
          </div>
        </div>
      </div>

      <div className={`text-center ${isFirst ? 'mt-20 mb-6' : 'mt-12 mb-4'} w-full`}>
        <h3 className={`text-headline-md text-on-surface truncate ${isFirst ? 'text-2xl' : ''}`}>
          {name}
        </h3>
        <p className="text-outline text-label-sm mt-1">Lvl {level}</p>
      </div>

      <div className={`w-full bg-surface-container-low rounded-full ${isFirst ? 'h-2.5' : 'h-2'} mb-2 shadow-sunken`}>
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${Math.min(100, (exp / Math.max(1, exp + 1000)) * 100)}%` }}
        />
      </div>
      <div className="flex justify-between w-full text-xs text-outline text-label-sm">
        <span>{exp.toLocaleString()} XP</span>
      </div>
    </div>
  );
}
