import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, TestTube2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import useJobUpdates from '../hooks/useJobUpdates';

const TYPES = ['Greeting', 'Leaving', 'Boosting', 'Leveling', 'Logging'];

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

  if (isLoading) return <p className="text-zinc-500">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">System Messages</h1>
        <p className="text-zinc-400">Gắn channel + embed cho từng event (Greeting, Leaving, ...).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {TYPES.map((type) => {
          const row = findRow(type);
          return (
            <div key={type} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{type}</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => sendTest(type)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 text-xs hover:bg-amber-500/20"
                  >
                    <TestTube2 className="w-4 h-4" /> Test
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Channel</label>
                <select
                  value={row.channel_id || ''}
                  onChange={(e) => setChannel(type, e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— Disabled —</option>
                  {textChannels.map((ch) => (
                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Embed</label>
                <select
                  value={row.embed_id || ''}
                  onChange={(e) => setEmbed(type, e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
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
    <form onSubmit={handleSend} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Send className="w-4 h-4 text-indigo-300" />
        <h3 className="font-semibold text-white">Manual Send</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-400">Channel</label>
          <select name="channelId" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm">
            <option value="">Select channel</option>
            {textChannels.map((ch) => (
              <option key={ch.id} value={ch.id}>#{ch.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-400">Embed</label>
          <select name="embedId" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm">
            <option value="">— None —</option>
            {embeds.map((e) => (
              <option key={e.embed_id} value={e.embed_id}>{e.embed_name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-400">Message content <span className="text-zinc-600">(tuỳ chọn)</span></label>
        <textarea
          name="content"
          placeholder="Nội dung văn bản hoặc placeholders — có thể để trống nếu đã chọn embed"
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm mt-1"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm font-medium"
      >
        <Send className="w-4 h-4" /> Queue message
      </button>
    </form>
  );
}
