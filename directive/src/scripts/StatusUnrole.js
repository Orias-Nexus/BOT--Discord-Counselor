import * as api from '../api.js';

/** Chỉ chấp nhận Role ID (số 17–19 chữ số). Từ slash option string hoặc modal. */
function getRoleId(interaction, actionContext, key) {
  const opt = interaction.options?.get?.(key);
  const raw = (opt?.value ?? actionContext?.modalValues?.[key])?.trim?.();
  if (!raw) return null;
  return /^\d{17,19}$/.test(raw) ? raw : null;
}

/** Hiển thị: role ID -> tên role hoặc ID. */
function roleIdToDisplay(guild, roleId) {
  if (!roleId) return '';
  return guild.roles.cache.get(roleId)?.name ?? roleId;
}

export async function run(interaction, client, actionContext = {}) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  const unrole_mute = getRoleId(interaction, actionContext, 'mute');
  const unrole_lock = getRoleId(interaction, actionContext, 'lock');
  await api.ensureServer(guild.id);
  await api.setUnroles(guild.id, { unrole_mute, unrole_lock });
  const server = await api.getServer(guild.id);
  const fn = await api.getFunction('StatusUnrole').catch(() => null);
  const content = api.formatEphemeralContent(api.replacePlaceholders(
    fn?.embed?.content ?? 'Updated Status Unrole: \\n Mute: {unrole_mute} \\n Lock: {unrole_lock}.',
    {
      unrole_mute: roleIdToDisplay(guild, server?.unrole_mute),
      unrole_lock: roleIdToDisplay(guild, server?.unrole_lock),
    }
  ));
  await api.replyOrEdit(interaction, content);
}
