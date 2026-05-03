import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import useJobUpdates from '../hooks/useJobUpdates';
import { getChannelTypeLabel, CHANNEL_TYPE } from '../utils/channelTypes';

/** Prefix channel name with a type symbol like Discord does */
function channelPrefix(ch) {
  switch (ch.type) {
    case CHANNEL_TYPE.GUILD_VOICE:       return '🔊 ';
    case CHANNEL_TYPE.GUILD_STAGE_VOICE: return '🎙️ ';
    case CHANNEL_TYPE.GUILD_ANNOUNCEMENT:return '📢 ';
    case CHANNEL_TYPE.GUILD_FORUM:       return '💬 ';
    case CHANNEL_TYPE.GUILD_MEDIA:       return '🖼️ ';
    case CHANNEL_TYPE.GUILD_CATEGORY:    return '📁 ';
    default:                             return '# ';
  }
}

const TYPES = ['Greeting', 'Leaving', 'Boosting', 'Leveling', 'Logging'];

const TYPE_META = {
  Greeting: { icon: 'waving_hand', color: 'bg-primary-fixed text-primary' },
  Leaving: { icon: 'directions_walk', color: 'bg-secondary-fixed text-secondary' },
  Boosting: { icon: 'rocket_launch', color: 'bg-tertiary-fixed text-tertiary' },
  Leveling: { icon: 'trending_up', color: 'bg-primary-fixed text-primary-container' },
  Logging: { icon: 'receipt_long', color: 'bg-surface-variant text-on-surface-variant' },
};

export default function Messages() {
  const { selectedServerId } = useAuth();
  const qc = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}/messages`);
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(selectedServerId),
  });

  const { data: embeds = [] } = useQuery({
    queryKey: ['embeds', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}/embeds`);
      return data;
    },
    enabled: Boolean(selectedServerId),
  });

  useJobUpdates();

  const { data: discordInfo } = useQuery({
    queryKey: ['discord-info', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}/discord-info`);
      return data;
    },
    enabled: Boolean(selectedServerId),
    retry: false,
  });

  const findRow = (type) => messages.find((m) => m.messages_type === type) || { messages_type: type };

  const setChannel = async (type, channelId) => {
    try {
      await api.patch(`/servers/${selectedServerId}/messages/${type}/channel`, { channel_id: channelId || null });
      qc.invalidateQueries({ queryKey: ['messages', selectedServerId] });
      toast.success(`${type} channel updated`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const setEmbed = async (type, embedId) => {
    try {
      await api.patch(`/servers/${selectedServerId}/messages/${type}/embed`, { embed_id: embedId || null });
      qc.invalidateQueries({ queryKey: ['messages', selectedServerId] });
      toast.success(`${type} embed updated`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const sendTest = async (type) => {
    try {
      await api.post(`/servers/${selectedServerId}/messages/${type}/test`);
      toast.success('Test job queued');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Queue failed');
    }
  };

  const textChannels = (discordInfo?.channels ?? []).filter((c) => c.isText);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-display-lg text-on-surface mb-2">System Messages</h2>
        <p className="text-body-lg text-on-surface-variant">
          Configure channels and embeds for each event type (Greeting, Leaving, ...).
        </p>
      </div>

      {/* Message Type Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {TYPES.map((type) => {
          const row = findRow(type);
          const meta = TYPE_META[type] || TYPE_META.Logging;
          return (
            <div key={type} className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${meta.color}`}>
                    <span className="material-symbols-outlined">{meta.icon}</span>
                  </div>
                  <h3 className="text-headline-md text-on-surface">{type}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => sendTest(type)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary-fixed text-secondary text-label-sm hover:bg-secondary-fixed-dim transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">science</span>
                  Test
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant">Channel</label>
                <select
                  value={row.channel_id || ''}
                  onChange={(e) => setChannel(type, e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface"
                >
                  <option value="">— Disabled —</option>
                  {textChannels.map((ch) => (
                    <option key={ch.id} value={ch.id}>{channelPrefix(ch)}{ch.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant">Embed Template</label>
                <select
                  value={row.embed_id || ''}
                  onChange={(e) => setEmbed(type, e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface"
                >
                  <option value="">— Plain text —</option>
                  {embeds.map((e) => (
                    <option key={e.embed_id} value={e.embed_id}>{e.embed_name}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Sender */}
      <ManualSender textChannels={textChannels} embeds={embeds} serverId={selectedServerId} />
    </div>
  );
}

function ManualSender({ textChannels, embeds, serverId }) {
  const handleSend = async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const channelId = fd.get('channelId');
    const content = fd.get('content')?.trim() || null;
    const embedId = fd.get('embedId') || null;
    if (!channelId) return toast.error('Chọn channel');
    try {
      const { data } = await api.post(`/servers/${serverId}/messages/send`, {
        channelId,
        content,
        embedId,
      });
      toast.success(`Đã enqueue message (Job #${data.jobId})`);
      event.currentTarget.reset();
    } catch (err) {
      if (!err.response) {
        toast.warning('Request bị gián đoạn — tin nhắn có thể đã được gửi. Kiểm tra Discord.');
        return;
      }
      const msg = typeof err.response.data?.error === 'string'
        ? err.response.data.error
        : `Server error (${err.response.status})`;
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSend} className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary-fixed">
          <span className="material-symbols-outlined text-primary">send</span>
        </div>
        <h3 className="text-headline-md text-on-surface">Manual Send</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-label-sm text-on-surface-variant">Channel</label>
          <select name="channelId" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface">
            <option value="">Select channel</option>
            {textChannels.map((ch) => (
              <option key={ch.id} value={ch.id}>{channelPrefix(ch)}{ch.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-label-sm text-on-surface-variant">Embed</label>
          <select name="embedId" className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface">
            <option value="">— None —</option>
            {embeds.map((e) => (
              <option key={e.embed_id} value={e.embed_id}>{e.embed_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-label-sm text-on-surface-variant">
          Message content <span className="text-outline-variant">(optional)</span>
        </label>
        <textarea
          name="content"
          placeholder="Text content or placeholders — leave blank if using an embed"
          rows={3}
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary text-label-sm hover:opacity-90 transition-opacity shadow-sm"
      >
        <span className="material-symbols-outlined text-sm">send</span>
        Queue Message
      </button>
    </form>
  );
}
