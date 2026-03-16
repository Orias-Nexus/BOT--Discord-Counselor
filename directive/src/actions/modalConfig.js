import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

const MODAL_PREFIX = 'modal_';

/** Tổng phút -> chuỗi dd:hh:mm (prefill StatusTimeout). */
function formatMinutesToDDHHMM(totalMinutes) {
  if (totalMinutes == null || totalMinutes < 0) return '';
  const d = Math.floor(totalMinutes / (24 * 60));
  const r = totalMinutes % (24 * 60);
  const h = Math.floor(r / 60);
  const m = r % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d)}:${pad(h)}:${pad(m)}`;
}

/** Script cần modal khi gọi từ nút: [scriptName, title, { inputCustomId: { label, placeholder, style, required } }] */
const MODALS = {
  StatusTimeout: {
    title: 'Thời gian Warn / Mute / Lock / Newbie',
    inputs: [
      { id: 'warn', label: 'Time Warn (dd:hh:mm hoặc phút)', placeholder: 'VD: 90 hoặc 00:01:30', required: false },
      { id: 'mute', label: 'Time Mute (dd:hh:mm hoặc phút)', placeholder: 'VD: 90 hoặc 00:01:30', required: false },
      { id: 'lock', label: 'Time Lock (dd:hh:mm hoặc phút)', placeholder: 'VD: 90 hoặc 00:01:30', required: false },
      { id: 'new', label: 'Time Newbie (dd:hh:mm hoặc phút)', placeholder: 'VD: 90 hoặc 00:01:30', required: false },
      { id: 'all', label: 'Dùng chung cho cả 4', placeholder: 'VD: 90 hoặc 00:01:30', required: false },
    ],
  },
  StatusRole: {
    title: 'Role Warn / Mute / Lock / Newbie',
    inputs: [
      { id: 'warn', label: 'Tên role Warn', placeholder: 'Warning Role', required: false },
      { id: 'mute', label: 'Tên role Mute', placeholder: 'Muted Role', required: false },
      { id: 'lock', label: 'Tên role Lock', placeholder: 'Locked Role', required: false },
      { id: 'new', label: 'Tên role Newbie', placeholder: 'Newbie Role', required: false },
    ],
  },
  StatusUnrole: {
    title: 'Unrole Mute / Lock',
    inputs: [
      { id: 'mute', label: 'Role ID gỡ khi Mute', placeholder: 'VD: 1234567890123456789', required: false },
      { id: 'lock', label: 'Role ID gỡ khi Lock', placeholder: 'VD: 1234567890123456789', required: false },
    ],
  },
  MemberRename: {
    title: 'Đổi tên thành viên',
    inputs: [{ id: 'setname', label: 'Tên mới (server)', placeholder: 'Tối đa 32 ký tự', required: true }],
  },
  MemberSetlevel: {
    title: 'Set level thành viên',
    inputs: [{ id: 'setlevel', label: 'Level (số nguyên)', placeholder: 'VD: 5', required: true }],
  },
  EmbedEditBasic: {
    title: 'Edit Embed: Title, Description, Color, Fields',
    inputs: [
      { id: 'title', label: 'Title', placeholder: 'Embed Title', required: false },
      { id: 'description', label: 'Description', placeholder: 'Nội dung embed (có thể dùng {user_name}, {user_avatar}...)', required: false, style: 'Paragraph' },
      { id: 'color', label: 'Color (số thập lục hoặc decimal)', placeholder: 'VD: 5763719 hoặc 0x57F287', required: false },
      { id: 'fields', label: 'Fields (chỉ phần trong [ ])', placeholder: '{"name":"Tên","value":"Nội dung","inline":true}', required: false, style: 'Paragraph' },
    ],
  },
  EmbedEditAuthor: {
    title: 'Edit Embed: Author',
    inputs: [
      { id: 'author_name', label: 'Author Name', placeholder: 'Tên tác giả', required: false },
      { id: 'author_icon_url', label: 'Author Icon URL', placeholder: 'https://...', required: false },
    ],
  },
  EmbedEditFooter: {
    title: 'Edit Embed: Footer',
    inputs: [
      { id: 'footer_text', label: 'Footer Text', placeholder: 'Chữ ở footer', required: false },
      { id: 'footer_icon_url', label: 'Footer Icon URL', placeholder: 'https://...', required: false },
    ],
  },
  EmbedEditImages: {
    title: 'Edit Embed: Thumbnail & Image',
    inputs: [
      { id: 'thumbnail_url', label: 'Thumbnail URL', placeholder: 'https://... hoặc {user_avatar}', required: false },
      { id: 'image_url', label: 'Main Image URL', placeholder: 'https://...', required: false },
    ],
  },
  EmbedRename: {
    title: 'Đổi tên embed',
    inputs: [{ id: 'newname', label: 'Tên mới', placeholder: 'Tên embed', required: true }],
  },
  EmbedDelete: {
    title: 'Xác nhận xóa embed',
    inputs: [
      {
        id: 'confirm_name',
        label: 'Gõ chính xác tên embed để xác nhận xóa',
        placeholder: '(tên embed cần xóa)',
        required: true,
      },
    ],
  },
};

export const SCRIPTS_NEED_MODAL = new Set(Object.keys(MODALS));

/**
 * @param scriptName - tên script
 * @param contextPart - từ buildModalContext(guildId, targetId)
 * @param extra - { guild, server } cho StatusRole: placeholder/value động theo DB
 */
export function getModalForScript(scriptName, contextPart, extra = {}) {
  const config = MODALS[scriptName];
  if (!config) return null;
  const customId = `${MODAL_PREFIX}${scriptName}_${contextPart}`;
  const modal = new ModalBuilder().setCustomId(customId).setTitle(config.title.slice(0, 45));
  const { guild, server, embed: embedData, embed_name: embedName, times, member, profile } = extra;
  const rolePlaceholders = { warn: 'Warning Role', mute: 'Muted Role', lock: 'Locked Role', new: 'Newbie Role' };
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
    return undefined;
  };
  const embedValue = (id) => {
    if (scriptName === 'EmbedRename' && id === 'newname') return embedName ?? '';
    if (scriptName === 'EmbedDelete' && id === 'confirm_name') return '';
    if (!embedData) return undefined;
    if (scriptName === 'EmbedEditBasic') {
      if (id === 'title') return embedData.title ?? '';
      if (id === 'description') return embedData.description ?? '';
      if (id === 'color') return embedData.color != null ? String(embedData.color) : '';
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
        placeholder = (existingName ?? 'Tên role cũ').slice(0, 100);
        value = existingName ?? '';
      } else {
        placeholder = rolePlaceholders[input.id];
      }
    }
    const isParagraph = input.style === 'Paragraph';
    const builder = new TextInputBuilder()
      .setCustomId(input.id)
      .setLabel(input.label.slice(0, 45))
      .setStyle(isParagraph ? TextInputStyle.Paragraph : TextInputStyle.Short)
      .setRequired(Boolean(input.required))
      .setPlaceholder(placeholder)
      .setMaxLength(isParagraph ? 4000 : 100);
    if (value !== undefined) builder.setValue(value.slice(0, isParagraph ? 4000 : 100));
    modal.addComponents(new ActionRowBuilder().addComponents(builder));
  }
  return modal;
}

const CONTEXT_SEP = '|';

/**
 * Parse modal customId: modal_ScriptName_guildId|targetId (targetId có thể là 'server')
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

/** Build context part for modal customId: guildId|targetId hoặc guildId|server */
export function buildModalContext(guildId, targetId) {
  return `${guildId}${CONTEXT_SEP}${targetId ?? 'server'}`;
}

/** Lấy danh sách input id của script (để thu thập giá trị từ modal submit). */
export function getModalInputIds(scriptName) {
  const config = MODALS[scriptName];
  return config ? config.inputs.map((i) => i.id) : [];
}

export { MODAL_PREFIX };
