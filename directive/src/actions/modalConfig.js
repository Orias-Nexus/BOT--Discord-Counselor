import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

const MODAL_PREFIX = 'modal_';

/** Total minutes → dd:hh:mm string (prefill StatusTimeout). */
function formatMinutesToDDHHMM(totalMinutes) {
  if (totalMinutes == null || totalMinutes < 0) return '';
  const d = Math.floor(totalMinutes / (24 * 60));
  const r = totalMinutes % (24 * 60);
  const h = Math.floor(r / 60);
  const m = r % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d)}:${pad(h)}:${pad(m)}`;
}

/** Script modal config: [scriptName, title, { inputCustomId: { label, placeholder, style, required } }]. */
const MODALS = {
  StatusTimeout: {
    title: 'Warn / Mute / Lock / Newbie duration',
    inputs: [
      { id: 'warn', label: 'Time Warn (dd:hh:mm or minutes)', placeholder: 'e.g. 90 or 00:01:30', required: false },
      { id: 'mute', label: 'Time Mute (dd:hh:mm or minutes)', placeholder: 'e.g. 90 or 00:01:30', required: false },
      { id: 'lock', label: 'Time Lock (dd:hh:mm or minutes)', placeholder: 'e.g. 90 or 00:01:30', required: false },
      { id: 'new', label: 'Time Newbie (dd:hh:mm or minutes)', placeholder: 'e.g. 90 or 00:01:30', required: false },
      { id: 'all', label: 'Same value for all four', placeholder: 'e.g. 90 or 00:01:30', required: false },
    ],
  },
  StatusRole: {
    title: 'Warn / Mute / Lock / Newbie roles',
    inputs: [
      { id: 'warn', label: 'Warn role name', placeholder: 'Warning Role', required: false },
      { id: 'mute', label: 'Mute role name', placeholder: 'Muted Role', required: false },
      { id: 'lock', label: 'Lock role name', placeholder: 'Locked Role', required: false },
      { id: 'new', label: 'Newbie role name', placeholder: 'Newbie Role', required: false },
    ],
  },
  StatusUnrole: {
    title: 'Unrole on Mute / Lock',
    inputs: [
      { id: 'mute', label: 'Role ID to remove on Mute', placeholder: 'e.g. 1234567890123456789', required: false },
      { id: 'lock', label: 'Role ID to remove on Lock', placeholder: 'e.g. 1234567890123456789', required: false },
    ],
  },
  MemberRename: {
    title: 'Rename member',
    inputs: [{ id: 'setname', label: 'Display name (server)', placeholder: 'Max 32 chars', required: true }],
  },
  MemberSetlevel: {
    title: 'Set member level',
    inputs: [{ id: 'setlevel', label: 'Level (integer)', placeholder: 'e.g. 5', required: true }],
  },
  EmbedEditBasic: {
    title: 'Edit Embed: Title, Description, Color, Fields',
    inputs: [
      { id: 'title', label: 'Title', placeholder: 'Embed Title', required: false },
      { id: 'description', label: 'Description', placeholder: 'e.g. {user_name}, {user_avatar}', required: false, style: 'Paragraph' },
      { id: 'color', label: 'Hex Color', placeholder: '#57F287', required: false },
      { id: 'fields', label: 'Fields', placeholder: '{"name":"name","value":"value","inline":true/false}', required: false, style: 'Paragraph' },
    ],
  },
  EmbedEditAuthor: {
    title: 'Edit Embed: Author',
    inputs: [
      { id: 'author_name', label: 'Author Name', placeholder: 'Author name', required: false },
      { id: 'author_icon_url', label: 'Author Icon URL', placeholder: 'https://...', required: false },
    ],
  },
  EmbedEditFooter: {
    title: 'Edit Embed: Footer',
    inputs: [
      { id: 'footer_text', label: 'Footer Text', placeholder: 'Footer text', required: false },
      { id: 'footer_icon_url', label: 'Footer Icon URL', placeholder: 'https://...', required: false },
    ],
  },
  EmbedEditImages: {
    title: 'Edit Embed: Thumbnail & Image',
    inputs: [
      { id: 'thumbnail_url', label: 'Thumbnail URL', placeholder: 'https://... or {user_avatar}', required: false },
      { id: 'image_url', label: 'Main Image URL', placeholder: 'https://...', required: false },
    ],
  },
  EmbedRename: {
    title: 'Rename embed',
    inputs: [{ id: 'newname', label: 'New name', placeholder: 'Embed name', required: true }],
  },
  EmbedDelete: {
    title: 'Confirm delete embed',
    inputs: [
      {
        id: 'confirm_name',
        label: 'Type embed name to confirm delete',
        placeholder: '(embed name to delete)',
        required: true,
      },
    ],
  },
  ChannelSlow: {
    title: 'Set slowmode duration',
    inputs: [
      { id: 'seconds', label: 'Seconds (0-21600)', placeholder: 'e.g. 30', required: true },
    ],
  },
  ChannelBitrate: {
    title: 'Set channel bitrate',
    inputs: [
      { id: 'bitrate', label: 'Bitrate in kbps (0 = max)', placeholder: 'e.g. 128', required: true },
    ],
  },
  ChannelLimit: {
    title: 'Set user limit',
    inputs: [
      { id: 'limit', label: 'User limit (0 = unlimited)', placeholder: 'e.g. 10', required: false },
    ],
  },
};

export const SCRIPTS_NEED_MODAL = new Set(Object.keys(MODALS));

/**
 * @param scriptName - script name
 * @param contextPart - from buildModalContext(guildId, targetId)
 * @param extra - { guild, server } for StatusRole: dynamic placeholder/value from DB
 */
export function getModalForScript(scriptName, contextPart, extra = {}) {
  const config = MODALS[scriptName];
  if (!config) return null;
  const customId = `${MODAL_PREFIX}${scriptName}_${contextPart}`;
  const modal = new ModalBuilder().setCustomId(customId).setTitle(config.title.slice(0, 45));
  const { guild, server, embed: embedData, embed_name: embedName, times, member, profile, channel } = extra;
  const rolePlaceholders = { warn: 'Warning Role', mute: 'Muted Role', lock: 'Locked Role', new: 'Newbie Role' };
  const existingRolePlaceholder = 'Existing role name';
  const contextValue = (id) => {
    if (scriptName === 'StatusTimeout' && times) {
      const key = { warn: 'time_warn', mute: 'time_mute', lock: 'time_lock', new: 'time_new' }[id];
      const v = key ? times[key] : undefined;
      return v != null ? formatMinutesToDDHHMM(v) : undefined;
    }
    if (scriptName === 'StatusUnrole' && server) {
      if (id === 'mute' && server.unrole_mute) return String(server.unrole_mute);
      if (id === 'lock' && server.unrole_lock) return String(server.unrole_lock);
    }
    if (scriptName === 'MemberRename' && id === 'setname' && member) {
      return (member.displayName ?? member.user?.username ?? '').slice(0, 32);
    }
    if (scriptName === 'MemberSetlevel' && id === 'setlevel' && profile) {
      const lvl = profile.member_level ?? profile.level;
      return lvl != null ? String(lvl) : undefined;
    }
    if (scriptName === 'ChannelSlow' && id === 'seconds' && channel) {
      return channel.rateLimitPerUser != null ? String(channel.rateLimitPerUser) : undefined;
    }
    if (scriptName === 'ChannelBitrate' && id === 'bitrate' && channel) {
      return channel.bitrate != null ? String(Math.floor(channel.bitrate / 1000)) : undefined;
    }
    if (scriptName === 'ChannelLimit' && id === 'limit' && channel) {
      return channel.userLimit ? String(channel.userLimit) : '';
    }
    return undefined;
  };
  const embedValue = (id) => {
    if (scriptName === 'EmbedRename' && id === 'newname') return embedName ?? '';
    if (scriptName === 'EmbedDelete' && id === 'confirm_name') return '';
    if (!embedData) return undefined;
    if (scriptName === 'EmbedEditBasic') {
      if (id === 'title') return embedData.title ?? '';
      if (id === 'description') return embedData.description ?? '';
      if (id === 'color') {
        if (embedData.color == null) return '';
        const raw = String(embedData.color).trim();
        if (/^#[0-9a-fA-F]{6}$/i.test(raw)) return raw.toUpperCase();
        const n = Number(raw);
        if (!Number.isFinite(n)) return '';
        const hex = Math.max(0, Math.min(0xffffff, Math.trunc(n))).toString(16).padStart(6, '0').toUpperCase();
        return `#${hex}`;
      }
      if (id === 'fields') {
        if (!Array.isArray(embedData.fields) || embedData.fields.length === 0) return '';
        const raw = JSON.stringify(embedData.fields);
        return raw.length > 2 ? raw.slice(1, -1) : '';
      }
    }
    if (scriptName === 'EmbedEditAuthor') {
      if (id === 'author_name') return embedData.author?.name ?? '';
      if (id === 'author_icon_url') return embedData.author?.icon_url ?? '';
    }
    if (scriptName === 'EmbedEditFooter') {
      if (id === 'footer_text') return embedData.footer?.text ?? '';
      if (id === 'footer_icon_url') return embedData.footer?.icon_url ?? '';
    }
    if (scriptName === 'EmbedEditImages') {
      if (id === 'thumbnail_url') return embedData.thumbnail?.url ?? '';
      if (id === 'image_url') return embedData.image?.url ?? '';
    }
    return undefined;
  };
  for (const input of config.inputs) {
    let placeholder = (input.placeholder || '').slice(0, 100);
    if (scriptName === 'EmbedDelete' && input.id === 'confirm_name' && embedName) placeholder = String(embedName).slice(0, 100);
    let value = embedValue(input.id) ?? contextValue(input.id);
    if (value === undefined && scriptName === 'StatusRole' && guild && server && input.id in rolePlaceholders) {
      const roleId = server[`role_${input.id}`];
      if (roleId) {
        const existingName = guild.roles.cache.get(roleId)?.name;
        placeholder = (existingName ?? existingRolePlaceholder).slice(0, 100);
        value = existingName ?? '';
      } else {
        placeholder = rolePlaceholders[input.id];
      }
    }
    const isParagraph = input.style === 'Paragraph';
    const maxLen = isParagraph ? 4000 : 100;
    const builder = new TextInputBuilder()
      .setCustomId(input.id)
      .setLabel(input.label.slice(0, 45))
      .setStyle(isParagraph ? TextInputStyle.Paragraph : TextInputStyle.Short)
      .setRequired(Boolean(input.required))
      .setPlaceholder(placeholder)
      .setMaxLength(maxLen);
    if (value !== undefined) {
      const sliced = String(value).slice(0, maxLen);
      if (sliced.length > 0) builder.setValue(sliced);
    }
    modal.addComponents(new ActionRowBuilder().addComponents(builder));
  }
  return modal;
}

const CONTEXT_SEP = '|';

/**
 * Parse modal customId: modal_ScriptName_guildId|targetId (targetId may be 'server').
 * @returns {{ scriptName: string, guildId: string, targetId: string | null }}
 */
export function parseModalCustomId(customId) {
  if (!customId || !customId.startsWith(MODAL_PREFIX)) return null;
  const rest = customId.slice(MODAL_PREFIX.length);
  const idx = rest.indexOf('_');
  if (idx <= 0) return null;
  const scriptName = rest.slice(0, idx);
  const contextPart = rest.slice(idx + 1) || '';
  const sepIdx = contextPart.indexOf(CONTEXT_SEP);
  if (sepIdx < 0) return null;
  const guildId = contextPart.slice(0, sepIdx);
  const targetOrServer = contextPart.slice(sepIdx + 1);
  const targetId = targetOrServer === 'server' ? null : targetOrServer;
  return { scriptName, guildId, targetId };
}

/** Build context part for modal customId: guildId|targetId or guildId|server. */
export function buildModalContext(guildId, targetId) {
  return `${guildId}${CONTEXT_SEP}${targetId ?? 'server'}`;
}

/** Returns input ids for script (to collect values from modal submit). */
export function getModalInputIds(scriptName) {
  const config = MODALS[scriptName];
  return config ? config.inputs.map((i) => i.id) : [];
}

export { MODAL_PREFIX };
