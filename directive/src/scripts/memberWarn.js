import * as api from '../api.js';

const SUCCESS_MESSAGE = "{Server Profile Name}'s Status is Warning until {Member Expires}.";

export async function run(interaction, client, actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const fromSlash = interaction.options != null;
  let member = fromSlash
    ? interaction.options.get('target')?.member ?? interaction.options.getUser('target')
    : (actionContext?.targetId ? await guild.members.fetch(actionContext.targetId).catch(() => null) : null);
  if (member?.id && !member.member) member = await guild.members.fetch(member.id).catch(() => null);
  if (!member) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Select a member (target).'));
    return;
  }
  await api.ensureServer(guild.id);
  const server = await api.getServer(guild.id);
  const timeWarn = server?.time_warn > 0 ? server.time_warn : null;
  const expiresAt = timeWarn ? new Date(Date.now() + timeWarn * 60 * 1000) : null;
  for (const roleId of [server?.role_mute, server?.role_lock, server?.role_new].filter(Boolean)) {
    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.remove(role).catch(() => {});
  }
  if (server?.role_warn) {
    const role = guild.roles.cache.get(server.role_warn);
    if (role) await member.roles.add(role).catch(() => {});
  }
  for (const roleId of [server?.unrole_mute, server?.unrole_lock].filter(Boolean)) {
    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.add(role).catch(() => {});
  }
  await api.ensureMember(guild.id, member.id, member.user?.username);
  await api.setMemberStatus(guild.id, member.id, 'Warning', expiresAt);
  const displayName = member.displayName ?? member.user?.username ?? 'User';
  const expiresStr = expiresAt ? expiresAt.toLocaleString('en-US') : 'permanent';
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { 'Server Profile Name': displayName, 'Member Expires': expiresStr }));
  await api.replyOrEdit(interaction, content);
  const updatedProfile = await api.getMember(guild.id, member.id).catch(() => null);
  return { updatedProfile, targetId: member.id };
}
