import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { BarChart3, Mic, Plus, Trash2, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import useJobUpdates from '../hooks/useJobUpdates';

const TYPES = [
  { key: 'Stats', label: 'Server Stats', icon: BarChart3, desc: 'Các voice channel hiển thị số liệu (members, boosts...).' },
  { key: 'Creator', label: 'Voice Creator', icon: Mic, desc: 'Khi member vào, bot auto-clone phòng riêng.' },
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

  useJobUpdates((job) => {
    if (job?.status === 'completed') qc.invalidateQueries({ queryKey: ['channels', selectedServerId] });
  });

  const byType = (type) => channels.filter((c) => c.category_type === type);

  const createCategory = async (type) => {
    try {
      setCreating(type);
      await api.post(`/servers/${selectedServerId}/channels`, {
        category_type: type,
        channels_idx: 0,
        create: true,
      });
      toast.success('Job queued. Bot đang tạo category...');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không tạo được category');
    } finally {
      setCreating(null);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Xoá category này khỏi Discord?')) return;
    try {
      await api.delete(`/servers/${selectedServerId}/channels/${categoryId}`);
      toast.success('Job queued. Bot đang xoá...');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xoá thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Channels</h1>
          <p className="text-zinc-400">Quản lý Server Stats + Voice Creator category.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-600 text-sm text-zinc-300"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {TYPES.map(({ key, label, icon: Icon, desc }) => {
          const list = byType(key);
          return (
            <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{label}</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">{desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={creating === key}
                  onClick={() => createCategory(key)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {creating === key ? 'Queuing...' : 'Tạo'}
                </button>
              </div>

              <ul className="divide-y divide-zinc-800">
                {list.length === 0 && (
                  <li className="py-6 text-center text-sm text-zinc-500">Chưa có {label} nào.</li>
                )}
                {list.map((ch) => (
                  <li key={ch.category_id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">{ch.category_id}</p>
                      <p className="text-xs text-zinc-500">idx = {ch.channels_idx}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCategory(ch.category_id)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
