import * as api from '../api.js';

const SUCCESS_MESSAGE = "{Server Profile Name}'s Status is Locked until {Member Expires}.";

const SUCCESS_MESSAGE = "{Server Profile Name}'s Status is Locked until {Member Expires} - UTC.";

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
  const timeLock = server?.time_lock > 0 ? server.time_lock : null;
  const expiresAt = timeLock ? new Date(Date.now() + timeLock * 60 * 1000) : null;
  for (const roleId of [server?.role_warn, server?.role_mute, server?.unrole_lock, server?.role_new].filter(Boolean)) {
    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.remove(role).catch(() => {});
  }
  if (server?.role_lock) {
    const role = guild.roles.cache.get(server.role_lock);
    if (role) await member.roles.add(role).catch(() => {});
  }
  await api.ensureMember(guild.id, member.id, member.user?.username);
  await api.setMemberStatus(guild.id, member.id, 'Locked', expiresAt);
  const displayName = member.displayName ?? member.user?.username ?? 'User';
<<<<<<< HEAD:directive/src/scripts/memberLock.js
  const expiresStr = expiresAt ? expiresAt.toLocaleString('en-US') : 'permanent';
=======
  const expiresStr = expiresAt ? expiresAt.toLocaleString('vi-VN') : 'vĩnh viễn';
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.):directive/src/scripts/MemberLock.js
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { 'Server Profile Name': displayName, 'Member Expires': expiresStr }));
  await api.replyOrEdit(interaction, content);
  const updatedProfile = await api.getMember(guild.id, member.id).catch(() => null);
  return { updatedProfile, targetId: member.id };
}
