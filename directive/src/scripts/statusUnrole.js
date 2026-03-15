import * as api from '../api.js';

const SUCCESS_MESSAGE = 'Updated Status Unrole: \\n Mute: {unrole_mute} \\n Lock: {unrole_lock}.';

<<<<<<< HEAD:directive/src/scripts/statusUnrole.js
const SUCCESS_MESSAGE = 'Updated Status Unrole: \\n Mute: {unrole_mute} \\n Lock: {unrole_lock}.';

/** Accepts Role from slash (Role option) or Role ID (17–19 digits) from modal. */
=======
/** Accepts Role ID only (17–19 digits). From slash option string or modal. */
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.):directive/src/scripts/StatusUnrole.js
function getRoleId(interaction, actionContext, key) {
  const role = interaction.options?.getRole?.(key) ?? null;
  if (role?.id) return String(role.id);

  const opt = interaction.options?.get?.(key);
  const raw = (opt?.value ?? actionContext?.modalValues?.[key])?.trim?.();
  if (!raw) return null;
  return /^\d{17,19}$/.test(raw) ? raw : null;
}

/** Display: role ID → role name or ID. */
function roleIdToDisplay(guild, roleId) {
  if (!roleId) return '';
  return guild.roles.cache.get(roleId)?.name ?? roleId;
}

export async function run(interaction, client, actionContext = {}) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const unrole_mute = getRoleId(interaction, actionContext, 'mute');
  const unrole_lock = getRoleId(interaction, actionContext, 'lock');
  await api.ensureServer(guild.id);
  await api.setUnroles(guild.id, { unrole_mute, unrole_lock });
  const server = await api.getServer(guild.id);
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, {
    unrole_mute: roleIdToDisplay(guild, server?.unrole_mute),
    unrole_lock: roleIdToDisplay(guild, server?.unrole_lock),
  }));
  await api.replyOrEdit(interaction, content);
}
