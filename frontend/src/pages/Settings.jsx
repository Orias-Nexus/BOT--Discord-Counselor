import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Shield } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const EMPTY_TIMES = { time_warn: 0, time_mute: 0, time_lock: 0, time_new: 0 };
const EMPTY_ROLES = { role_warn: '', role_mute: '', role_lock: '', role_new: '' };

export default function Settings() {
  const { selectedServerId } = useAuth();
  const qc = useQueryClient();

  const { data: server, isLoading } = useQuery({
    queryKey: ['server', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}`);
      return data;
    },
    enabled: Boolean(selectedServerId),
  });

  const [times, setTimes] = useState(EMPTY_TIMES);
  const [roles, setRoles] = useState(EMPTY_ROLES);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (!server) return;
    setTimes({
      time_warn: server.time_warn || 0,
      time_mute: server.time_mute || 0,
      time_lock: server.time_lock || 0,
      time_new: server.time_new || 0,
    });
    setRoles({
      role_warn: server.role_warn || '',
      role_mute: server.role_mute || '',
      role_lock: server.role_lock || '',
      role_new: server.role_new || '',
    });
  }, [server]);

  const saveTimes = async () => {
    try {
      setSaving('times');
      await api.patch(`/servers/${selectedServerId}/times`, {
        time_warn: Number(times.time_warn) || 0,
        time_mute: Number(times.time_mute) || 0,
        time_lock: Number(times.time_lock) || 0,
        time_new: Number(times.time_new) || 0,
      });
      qc.invalidateQueries({ queryKey: ['server', selectedServerId] });
      toast.success('Timeout durations saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(null);
    }
  };

  const saveRoles = async () => {
    try {
      setSaving('roles');
      await api.patch(`/servers/${selectedServerId}/roles`, roles);
      qc.invalidateQueries({ queryKey: ['server', selectedServerId] });
      toast.success('Roles saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-indigo-400 mt-20">
        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Server Settings</h1>
        <p className="text-zinc-400">
          Tier: <span className="text-indigo-300">{server?.status || 'Standard'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Timeout Durations" saveLabel="Save Durations" saving={saving === 'times'} onSave={saveTimes}>
          {Object.keys(EMPTY_TIMES).map((key) => (
            <NumberField
              key={key}
              label={`${key.replace('time_', '').toUpperCase()} (minutes)`}
              value={times[key]}
              onChange={(v) => setTimes((s) => ({ ...s, [key]: v }))}
            />
          ))}
        </Section>

        <Section title="Role Configurations" saveLabel="Save Roles" saving={saving === 'roles'} onSave={saveRoles} icon={Shield}>
          {Object.keys(EMPTY_ROLES).map((key) => (
            <TextField
              key={key}
              label={`${key.replace('role_', '').toUpperCase()} Role ID`}
              value={roles[key]}
              onChange={(v) => setRoles((s) => ({ ...s, [key]: v }))}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, onSave, saving, saveLabel, icon: Icon }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-indigo-300" />}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-sm"
      >
        <Save className="w-4 h-4" /> {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-400 text-xs">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
      />
    </label>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-400 text-xs">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono focus:border-indigo-500 outline-none"
      />
    </label>
  );
}
