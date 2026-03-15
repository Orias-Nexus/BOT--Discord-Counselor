import * as api from '../api.js';

const SUCCESS_MESSAGE = 'Updated Status Role: \\n Warn: {role_warn} \\n Mute: {role_mute} \\n Lock: {role_lock} \\n Newbie: {role_new}.';

<<<<<<< HEAD:directive/src/scripts/statusRole.js
const SUCCESS_MESSAGE = 'Updated Status Role: \\n Warn: {role_warn} \\n Mute: {role_mute} \\n Lock: {role_lock} \\n Newbie: {role_new}.';

=======
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.):directive/src/scripts/StatusRole.js
/** Get role name from slash option or modal (name only, no ID resolve). */
function getRoleName(interaction, actionContext, key) {
  const opt = interaction.options?.get?.(key);
  const raw = (opt?.value ?? actionContext?.modalValues?.[key])?.trim?.();
  return raw || null;
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
  await api.ensureServer(guild.id);
  const server = await api.getServer(guild.id) ?? {};
  const updates = { role_warn: server.role_warn ?? null, role_mute: server.role_mute ?? null, role_lock: server.role_lock ?? null, role_new: server.role_new ?? null };

  for (const key of ['warn', 'mute', 'lock', 'new']) {
    const roleName = getRoleName(interaction, actionContext, key);
    if (!roleName) continue;

    const dbKey = `role_${key}`;
    const existingId = server[dbKey];

    if (existingId) {
      const role = guild.roles.cache.get(existingId);
      if (role) {
        try {
          await role.edit({ name: roleName });
        } catch (err) {
          console.error(`[StatusRole] rename ${key}`, err);
        }
      }
    } else {
      try {
        const newRole = await guild.roles.create({ name: roleName });
        updates[dbKey] = newRole.id;
      } catch (err) {
        console.error(`[StatusRole] create ${key}`, err);
      }
    }
  }

  await api.setRoles(guild.id, updates);
  const updated = await api.getServer(guild.id);
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, {
    role_warn: roleIdToDisplay(guild, updated?.role_warn),
    role_mute: roleIdToDisplay(guild, updated?.role_mute),
    role_lock: roleIdToDisplay(guild, updated?.role_lock),
    role_new: roleIdToDisplay(guild, updated?.role_new),
  }));
  await api.replyOrEdit(interaction, content);
}
