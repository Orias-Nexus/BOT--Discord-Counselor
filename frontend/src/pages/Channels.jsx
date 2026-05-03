import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import useJobUpdates from '../hooks/useJobUpdates';

const TYPES = [
  {
    key: 'Stats',
    label: 'Server Stats',
    icon: 'analytics',
    desc: 'Voice channels that display live server metrics (members, boosts, etc.).',
  },
  {
    key: 'Creator',
    label: 'Voice Creator',
    icon: 'mic',
    desc: 'When a member joins, the bot auto-creates a private voice room.',
  },
];

export default function Channels() {
  const { selectedServerId } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(null);

  const { data: channels = [], isLoading, refetch } = useQuery({
    queryKey: ['channels', selectedServerId],
    queryFn: async () => {
      if (!selectedServerId) return [];
      const { data } = await api.get(`/servers/${selectedServerId}/channels`);
      return data;
    },
    enabled: Boolean(selectedServerId),
  });

  // Fetch discord-info to map category_id → Discord category name
  const { data: discordInfo } = useQuery({
    queryKey: ['discord-info', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}/discord-info`);
      return data;
    },
    enabled: Boolean(selectedServerId),
    retry: false,
  });

  useJobUpdates((job) => {
    if (job?.status === 'completed') qc.invalidateQueries({ queryKey: ['channels', selectedServerId] });
  });

  const byType = (type) => channels.filter((c) => c.category_type === type);

  // Build a map of channel/category ID → name from Discord cache
  const channelNameMap = {};
  if (discordInfo?.channels) {
    for (const ch of discordInfo.channels) {
      channelNameMap[ch.id] = ch.name;
    }
  }
  if (discordInfo?.categories) {
    for (const cat of discordInfo.categories) {
      channelNameMap[cat.id] = cat.name;
    }
  }

  const getChannelName = (id) => channelNameMap[id] || null;

  const createCategory = async (type) => {
    try {
      setCreating(type);
      await api.post(`/servers/${selectedServerId}/channels`, {
        category_type: type,
        channels_idx: 0,
        create: true,
      });
      toast.success('Job queued — bot is creating category...');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create category');
    } finally {
      setCreating(null);
    }
  };

  const deleteCategory = async (categoryId) => {
    const name = getChannelName(categoryId) || categoryId;
    if (!window.confirm(`Delete category "${name}" from Discord?`)) return;
    try {
      await api.delete(`/servers/${selectedServerId}/channels/${categoryId}`);
      toast.success('Job queued — bot is removing...');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-lg text-on-surface mb-2">Channels</h2>
          <p className="text-body-lg text-on-surface-variant">
            Manage Server Stats and Voice Creator categories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary text-label-sm transition-colors"
        >
          <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>
            sync
          </span>
          Refresh
        </button>
      </div>

      {/* Channel Type Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {TYPES.map(({ key, label, icon, desc }) => {
          const list = byType(key);
          return (
            <div key={key} className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg p-8">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-fixed rounded-xl">
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                  <div>
                    <h3 className="text-headline-md text-on-surface">{label}</h3>
                    <p className="text-body-md text-on-surface-variant mt-1 max-w-xs">{desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={creating === key}
                  onClick={() => createCategory(key)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-label-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  {creating === key ? 'Creating...' : 'Create'}
                </button>
              </div>

              {/* Channel List */}
              <div className="space-y-3">
                {list.length === 0 && (
                  <div className="py-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/50">
                    <span className="material-symbols-outlined text-3xl text-outline-variant mb-2">folder_open</span>
                    <p className="text-sm">No {label} categories yet.</p>
                  </div>
                )}
                {list.map((ch) => {
                  const name = getChannelName(ch.category_id);
                  return (
                    <div
                      key={ch.category_id}
                      className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          {key === 'Stats' ? 'bar_chart' : 'spatial_audio_off'}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {name ? `📁 ${name}` : 'Pending creation...'}
                          </p>
                          <p className="text-xs text-outline">
                            {key === 'Stats' ? 'Stats Category' : 'Voice Creator'} · {ch.channels_idx} child channel{ch.channels_idx !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCategory(ch.category_id)}
                        title="Delete category"
                        className="p-2 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
