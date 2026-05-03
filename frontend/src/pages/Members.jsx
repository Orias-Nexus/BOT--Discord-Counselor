import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import useJobUpdates from '../hooks/useJobUpdates';

const STATUS_META = {
  Good:   { label: 'Active', icon: 'check_circle', color: 'bg-primary-fixed text-primary' },
  Newbie: { label: 'Newbie', icon: 'person_add', color: 'bg-tertiary-fixed text-tertiary' },
  Warn:   { label: 'Warned', icon: 'warning', color: 'bg-secondary-fixed text-secondary' },
  Mute:   { label: 'Muted', icon: 'volume_off', color: 'bg-error-container text-error' },
  Lock:   { label: 'Locked', icon: 'lock', color: 'bg-surface-variant text-on-surface-variant' },
  Kick:   { label: 'Kicked', icon: 'block', color: 'bg-error-container text-error' },
  Leaved: { label: 'Left', icon: 'logout', color: 'bg-surface-variant text-on-surface-variant' },
};

const ACTIONS = [
  { key: 'warn', label: 'Warn', icon: 'warning', color: 'text-secondary bg-secondary-fixed hover:bg-secondary-fixed-dim' },
  { key: 'mute', label: 'Mute', icon: 'volume_off', color: 'text-error bg-error-container hover:bg-error-container/80' },
  { key: 'lock', label: 'Lock', icon: 'lock', color: 'text-on-surface-variant bg-surface-variant hover:bg-surface-container-high' },
  { key: 'reset', label: 'Reset', icon: 'restart_alt', color: 'text-primary bg-primary-fixed hover:bg-primary-fixed-dim' },
  { key: 'kick', label: 'Kick', icon: 'person_remove', color: 'text-error bg-error-container hover:bg-error-container/80' },
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
      (m.display_name || m.username || '').toLowerCase().includes(q) ||
      (m.username || '').toLowerCase().includes(q) ||
      (m.member_status || '').toLowerCase().includes(q)
    );
  }, [members, search]);

  const runAction = async (userId, action, displayName) => {
    try {
      await api.post(`/members/${selectedServerId}/${userId}/action`, { action });
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} queued for ${displayName}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  /** Resolve the best display name for a member */
  const getName = (m) => m.display_name || m.username || 'Unknown';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-display-lg text-on-surface mb-2">Members</h2>
          <p className="text-body-lg text-on-surface-variant">
            Manage member statuses and moderation actions.
            {members.length > 0 && (
              <span className="ml-2 text-label-sm text-outline bg-surface-variant px-2 py-0.5 rounded-full">
                {members.length} total
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:border-primary outline-none text-on-surface w-64"
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-variant">
              <th className="px-6 py-4 text-left text-label-sm text-on-surface-variant uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-left text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-label-sm text-on-surface-variant uppercase tracking-wider">Level / XP</th>
              <th className="px-6 py-4 text-right text-label-sm text-on-surface-variant uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-2xl text-primary">sync</span>
                  <p className="mt-2">Loading members...</p>
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl text-outline-variant">group_off</span>
                  <p className="mt-2">No members found.</p>
                </td>
              </tr>
            )}
            {filtered.map((m) => {
              const meta = STATUS_META[m.member_status] || {
                label: m.member_status || 'Newbie',
                icon: 'person_add',
                color: 'bg-tertiary-fixed text-tertiary',
              };
              const displayName = getName(m);
              return (
                <tr key={m.user_id} className="border-b border-surface-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary-fixed flex items-center justify-center">
                        {m.avatar ? (
                          <img src={`https://cdn.discordapp.com/avatars/${m.user_id}/${m.avatar}.png?size=64`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary text-sm font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-on-surface font-semibold">{displayName}</p>
                        {m.username && m.display_name && m.username !== m.display_name && (
                          <p className="text-xs text-outline">@{m.username}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                      <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div>
                      <p className="text-on-surface font-semibold">Level {m.member_level || 0}</p>
                      <p className="text-xs text-outline">{(m.member_exp || 0).toLocaleString()} XP</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex flex-wrap gap-1.5 justify-end">
                      {ACTIONS.map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          onClick={() => runAction(m.user_id, a.key, displayName)}
                          title={a.label}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${a.color}`}
                        >
                          <span className="material-symbols-outlined text-[14px]">{a.icon}</span>
                          <span className="hidden xl:inline">{a.label}</span>
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
