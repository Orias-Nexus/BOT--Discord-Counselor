import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

const MODAL_PREFIX = 'modal_';

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
  const { guild, server } = extra;
  const rolePlaceholders = { warn: 'Warning Role', mute: 'Muted Role', lock: 'Locked Role', new: 'Newbie Role' };
  for (const input of config.inputs) {
    let placeholder = (input.placeholder || '').slice(0, 100);
    let value = undefined;
    if (scriptName === 'StatusRole' && guild && server && input.id in rolePlaceholders) {
      const roleId = server[`role_${input.id}`];
      if (roleId) {
        const existingName = guild.roles.cache.get(roleId)?.name;
        placeholder = (existingName ?? 'Tên role cũ').slice(0, 100);
        value = existingName ?? '';
      } else {
        placeholder = rolePlaceholders[input.id];
      }
    }
    const builder = new TextInputBuilder()
      .setCustomId(input.id)
      .setLabel(input.label.slice(0, 45))
      .setStyle(TextInputStyle.Short)
      .setRequired(Boolean(input.required))
      .setPlaceholder(placeholder)
      .setMaxLength(100);
    if (value !== undefined) builder.setValue(value);
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
