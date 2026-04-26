import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Save } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Embeds() {
  const { selectedServerId } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const { data: embeds = [], isLoading } = useQuery({
    queryKey: ['embeds', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}/embeds`);
      return data;
    },
    enabled: Boolean(selectedServerId),
  });

  const createEmbed = async () => {
    const name = window.prompt('Tên embed mới:');
    if (!name) return;
    try {
      await api.post(`/servers/${selectedServerId}/embeds`, { embed_name: name, embed: {} });
      qc.invalidateQueries({ queryKey: ['embeds', selectedServerId] });
      toast.success('Đã tạo embed mới');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Tạo embed thất bại');
    }
  };

  const removeEmbed = async (embedId) => {
    if (!window.confirm('Xoá embed này?')) return;
    try {
      await api.delete(`/servers/${selectedServerId}/embeds/${embedId}`);
      qc.invalidateQueries({ queryKey: ['embeds', selectedServerId] });
      toast.success('Đã xoá');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xoá thất bại');
    }
  };

  const startEdit = (emb) => {
    setEditing(emb.embed_id);
    setDraft(JSON.stringify(emb.embed ?? {}, null, 2));
  };

  const saveEdit = async () => {
    try {
      const parsed = JSON.parse(draft);
      await api.patch(`/servers/${selectedServerId}/embeds/${editing}`, { embed: parsed });
      qc.invalidateQueries({ queryKey: ['embeds', selectedServerId] });
      toast.success('Saved');
      setEditing(null);
    } catch (err) {
      toast.error(err.message?.includes('JSON') ? 'JSON không hợp lệ' : err.response?.data?.error || 'Lỗi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Embeds</h1>
          <p className="text-zinc-400">Tạo & chỉnh sửa JSON embed dùng chung cho messages/slash.</p>
        </div>
        <button
          type="button"
          onClick={createEmbed}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {isLoading && <p className="text-zinc-500">Đang tải...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {embeds.map((emb) => {
          const isEditing = editing === emb.embed_id;
          return (
            <div key={emb.embed_id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{emb.embed_name}</h3>
                  <p className="text-xs font-mono text-zinc-500 truncate max-w-[250px]">{emb.embed_id}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => startEdit(emb)}
                      className="p-1.5 rounded hover:bg-white/5 text-zinc-300"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-400"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeEmbed(emb.embed_id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {isEditing ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full h-56 bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 h-56 overflow-auto text-xs text-zinc-400">
                  {JSON.stringify(emb.embed ?? {}, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
