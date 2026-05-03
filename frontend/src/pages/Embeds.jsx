import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import DiscordEmbedPreview from '../components/DiscordEmbedPreview';
import { resolveEmbedPreview, hasPlaceholders } from '../utils/placeholderPreview';

export default function Embeds() {
  const { selectedServerId } = useAuth();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);

  const { data: embeds = [], isLoading } = useQuery({
    queryKey: ['embeds', selectedServerId],
    queryFn: async () => {
      const { data } = await api.get(`/servers/${selectedServerId}/embeds`);
      return data;
    },
    enabled: Boolean(selectedServerId),
  });

  const createEmbed = async () => {
    const name = window.prompt('Enter a name for the new embed:');
    if (!name?.trim()) return;
    try {
      await api.post(`/servers/${selectedServerId}/embeds`, { embed_name: name.trim(), embed: {} });
      qc.invalidateQueries({ queryKey: ['embeds', selectedServerId] });
      toast.success('Embed created');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    }
  };

  const removeEmbed = async (embedId, embedName) => {
    if (!window.confirm(`Delete "${embedName}"?`)) return;
    try {
      await api.delete(`/servers/${selectedServerId}/embeds/${embedId}`);
      qc.invalidateQueries({ queryKey: ['embeds', selectedServerId] });
      toast.success('Embed deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const editingEmbed = editingId ? embeds.find((e) => e.embed_id === editingId) : null;

  if (editingEmbed) {
    return (
      <EmbedEditor
        embed={editingEmbed}
        serverId={selectedServerId}
        onClose={() => setEditingId(null)}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ['embeds', selectedServerId] });
          setEditingId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-lg text-on-surface mb-2">Embeds</h2>
          <p className="text-body-lg text-on-surface-variant">
            Create and manage reusable embed templates for messages.
            {embeds.length > 0 && (
              <span className="ml-2 text-label-sm text-outline bg-surface-variant px-2 py-0.5 rounded-full">
                {embeds.length} template{embeds.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button type="button" onClick={createEmbed} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary text-label-sm hover:opacity-90 transition-opacity shadow-sm">
          <span className="material-symbols-outlined text-sm">add</span>
          New Embed
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {embeds.map((emb) => {
          const embedData = emb.embed ?? {};
          const colorHex = embedData.color ? `#${Number(embedData.color).toString(16).padStart(6, '0')}` : '#4f614e';
          return (
            <div key={emb.embed_id} className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg overflow-hidden group">
              <div className="h-2" style={{ backgroundColor: colorHex }} />
              <div className="p-6">
                <h3 className="text-headline-md text-on-surface truncate mb-1">{emb.embed_name}</h3>
                <p className="text-xs text-outline mb-4">
                  {embedData.title ? `Title: ${embedData.title.slice(0, 40)}...` : 'No title set'}
                  {embedData.fields?.length > 0 && ` · ${embedData.fields.length} field${embedData.fields.length !== 1 ? 's' : ''}`}
                </p>
                <div className="rounded-xl overflow-hidden mb-4">
                  <DiscordEmbedPreview embed={resolveEmbedPreview(embedData)} showPlaceholderHint={hasPlaceholders(JSON.stringify(embedData))} />
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setEditingId(emb.embed_id)} className="flex-1 py-2 rounded-xl bg-primary-fixed text-primary text-label-sm hover:bg-primary-fixed-dim transition-colors text-center">
                    Edit
                  </button>
                  <button type="button" onClick={() => removeEmbed(emb.embed_id, emb.embed_name)} className="p-2 rounded-xl text-outline hover:text-error hover:bg-error-container/30 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Form-based Embed Editor ─── */

function EmbedEditor({ embed, serverId, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const e = embed.embed ?? {};
    return {
      title: e.title || '',
      description: e.description || '',
      color: e.color ? `#${Number(e.color).toString(16).padStart(6, '0')}` : '#4f614e',
      authorName: e.author?.name || '',
      authorIconUrl: e.author?.icon_url || '',
      authorUrl: e.author?.url || '',
      thumbnailUrl: e.thumbnail?.url || '',
      imageUrl: e.image?.url || '',
      footerText: e.footer?.text || '',
      footerIconUrl: e.footer?.icon_url || '',
      fields: e.fields?.map(f => ({ ...f })) || [],
    };
  });
  const [mode, setMode] = useState('form'); // 'form' | 'json'
  const [jsonDraft, setJsonDraft] = useState('');
  const [saving, setSaving] = useState(false);

  // Build embed object from form state
  const buildEmbed = () => {
    const obj = {};
    if (form.title.trim()) obj.title = form.title;
    if (form.description.trim()) obj.description = form.description;
    if (form.color) {
      const hex = form.color.replace('#', '');
      obj.color = parseInt(hex, 16) || 0;
    }
    if (form.authorName.trim()) {
      obj.author = { name: form.authorName };
      if (form.authorIconUrl.trim()) obj.author.icon_url = form.authorIconUrl;
      if (form.authorUrl.trim()) obj.author.url = form.authorUrl;
    }
    if (form.thumbnailUrl.trim()) obj.thumbnail = { url: form.thumbnailUrl };
    if (form.imageUrl.trim()) obj.image = { url: form.imageUrl };
    if (form.footerText.trim()) {
      obj.footer = { text: form.footerText };
      if (form.footerIconUrl.trim()) obj.footer.icon_url = form.footerIconUrl;
    }
    if (form.fields.length > 0) {
      obj.fields = form.fields.filter(f => f.name?.trim() || f.value?.trim());
    }
    return obj;
  };

  const embedObj = buildEmbed();
  const containsPlaceholders = JSON.stringify(embedObj).includes('{') && hasPlaceholders(JSON.stringify(embedObj));
  const previewEmbed = containsPlaceholders ? resolveEmbedPreview(embedObj) : embedObj;

  const handleSave = async () => {
    try {
      setSaving(true);
      let finalEmbed;
      if (mode === 'json') {
        finalEmbed = JSON.parse(jsonDraft);
      } else {
        finalEmbed = buildEmbed();
      }
      await api.patch(`/servers/${serverId}/embeds/${embed.embed_id}`, { embed: finalEmbed });
      toast.success('Embed saved');
      onSaved();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error('Invalid JSON syntax');
      } else {
        toast.error(err.response?.data?.error || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    setForm(f => ({ ...f, fields: [...f.fields, { name: '', value: '', inline: false }] }));
  };

  const updateField = (idx, key, val) => {
    setForm(f => ({
      ...f,
      fields: f.fields.map((fld, i) => i === idx ? { ...fld, [key]: val } : fld),
    }));
  };

  const removeField = (idx) => {
    setForm(f => ({ ...f, fields: f.fields.filter((_, i) => i !== idx) }));
  };

  const switchToJson = () => {
    setJsonDraft(JSON.stringify(buildEmbed(), null, 2));
    setMode('json');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-lg text-on-surface mb-1">{embed.embed_name}</h2>
          <p className="text-body-md text-outline">Embed Template Editor</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-outline-variant">
            <button type="button" onClick={() => setMode('form')} className={`px-4 py-2 text-label-sm transition-colors ${mode === 'form' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
              <i className="fa-solid fa-sliders mr-1.5" />Form
            </button>
            <button type="button" onClick={switchToJson} className={`px-4 py-2 text-label-sm transition-colors ${mode === 'json' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
              <i className="fa-solid fa-code mr-1.5" />JSON
            </button>
          </div>
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-label-sm hover:border-primary hover:text-primary transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-label-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm">
            <span className="material-symbols-outlined text-sm">save</span>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor Panel */}
        <div className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg p-6 space-y-5">
          {mode === 'form' ? (
            <>
              {/* Basic Fields */}
              <FormSection title="Basic" icon="title">
                <FormInput label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Embed title — supports {user_name} placeholders" />
                <FormTextarea label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Main embed content — supports placeholders" rows={4} />
                <div className="flex items-center gap-3">
                  <label className="text-label-sm text-on-surface-variant">Color</label>
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-8 rounded border border-outline-variant cursor-pointer" />
                  <span className="text-xs text-outline font-mono">{form.color}</span>
                </div>
              </FormSection>

              {/* Author */}
              <FormSection title="Author" icon="person">
                <FormInput label="Name" value={form.authorName} onChange={v => setForm(f => ({ ...f, authorName: v }))} placeholder="Author name" />
                <FormInput label="Icon URL" value={form.authorIconUrl} onChange={v => setForm(f => ({ ...f, authorIconUrl: v }))} placeholder="{user_avatar} or https://..." />
              </FormSection>

              {/* Images */}
              <FormSection title="Images" icon="image">
                <FormInput label="Thumbnail URL" value={form.thumbnailUrl} onChange={v => setForm(f => ({ ...f, thumbnailUrl: v }))} placeholder="Small image (top-right)" />
                <FormInput label="Image URL" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} placeholder="Large image (below description)" />
              </FormSection>

              {/* Footer */}
              <FormSection title="Footer" icon="short_text">
                <FormInput label="Text" value={form.footerText} onChange={v => setForm(f => ({ ...f, footerText: v }))} placeholder="Footer text" />
                <FormInput label="Icon URL" value={form.footerIconUrl} onChange={v => setForm(f => ({ ...f, footerIconUrl: v }))} placeholder="Footer icon URL" />
              </FormSection>

              {/* Fields */}
              <FormSection title={`Fields (${form.fields.length})`} icon="view_list">
                {form.fields.map((fld, idx) => (
                  <div key={idx} className="p-3 bg-surface-container-low rounded-xl space-y-2 relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-label-sm text-on-surface-variant">Field #{idx + 1}</span>
                      <button type="button" onClick={() => removeField(idx)} className="text-outline hover:text-error text-xs">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                    <FormInput label="Name" value={fld.name || ''} onChange={v => updateField(idx, 'name', v)} placeholder="Field name" />
                    <FormInput label="Value" value={fld.value || ''} onChange={v => updateField(idx, 'value', v)} placeholder="Field value" />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!fld.inline} onChange={e => updateField(idx, 'inline', e.target.checked)} className="accent-primary" />
                      <span className="text-on-surface-variant">Inline</span>
                    </label>
                  </div>
                ))}
                <button type="button" onClick={addField} className="w-full py-2 border-2 border-dashed border-outline-variant/50 rounded-xl text-label-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">add</span>
                  Add Field
                </button>
              </FormSection>
            </>
          ) : (
            /* JSON Mode */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">code</span>
                <h3 className="text-headline-md text-on-surface">JSON Editor</h3>
              </div>
              <textarea
                value={jsonDraft}
                onChange={e => setJsonDraft(e.target.value)}
                spellCheck={false}
                className="w-full h-[500px] bg-surface-container-low border border-outline-variant rounded-xl p-4 font-mono text-xs text-on-surface focus:border-primary outline-none resize-y"
              />
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="bg-surface-container-lowest rounded-3xl ambient-shadow-lg p-6 sticky top-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-tertiary-fixed rounded-lg">
              <span className="material-symbols-outlined text-tertiary text-sm">visibility</span>
            </div>
            <h3 className="text-headline-md text-on-surface">Live Preview</h3>
          </div>
          <DiscordEmbedPreview embed={previewEmbed} showPlaceholderHint={containsPlaceholders} />
        </div>
      </div>
    </div>
  );
}

/* ─── Form Primitives ─── */

function FormSection({ title, icon, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
        <h4 className="text-label-sm text-on-surface uppercase tracking-wider font-bold">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-on-surface-variant">{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary outline-none placeholder:text-outline-variant/60" />
    </label>
  );
}

function FormTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-on-surface-variant">{label}</span>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary outline-none resize-y placeholder:text-outline-variant/60" />
    </label>
  );
}
