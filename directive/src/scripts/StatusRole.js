import * as api from '../api.js';
import { getEmbedContent } from '../embedDefaults.js';

/** Lấy tên role từ slash option hoặc modal (chỉ tên, không resolve ID). */
function getRoleName(interaction, actionContext, key) {
  const opt = interaction.options?.get?.(key);
  const raw = (opt?.value ?? actionContext?.modalValues?.[key])?.trim?.();
  return raw || null;
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
  const content = api.formatEphemeralContent(api.replacePlaceholders(
    getEmbedContent('StatusRole') ?? 'Updated Status Role: \\n Warn: {role_warn} \\n Mute: {role_mute} \\n Lock: {role_lock} \\n Newbie: {role_new}.',
    {
      role_warn: roleIdToDisplay(guild, updated?.role_warn),
      role_mute: roleIdToDisplay(guild, updated?.role_mute),
      role_lock: roleIdToDisplay(guild, updated?.role_lock),
      role_new: roleIdToDisplay(guild, updated?.role_new),
    }
  ));
  await api.replyOrEdit(interaction, content);
}
