import * as api from '../api.js';
import { sendAuditLog } from '../utils/auditLogger.js';

const SUCCESS_MESSAGE = "{Server Profile Name}'s Status is Good now.";
const FAIL_MESSAGE = "Cannot reset {Server Profile Name}'s status. Make sure the bot's role is above theirs and has Manage Roles permission.";

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
  const displayName = member.displayName ?? member.user?.username ?? 'User';
  let actionFailed = false;
  for (const roleId of [server?.role_warn, server?.role_mute, server?.role_lock, server?.role_new].filter(Boolean)) {
    const role = guild.roles.cache.get(roleId);
    if (role) {
      const err = await member.roles.remove(role).then(() => null).catch((e) => e);
      if (err) { actionFailed = true; break; }
    }
  }
  if (actionFailed) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent(api.replacePlaceholders(FAIL_MESSAGE, { 'Server Profile Name': displayName })));
    return;
  }
  for (const roleId of [server?.unrole_mute, server?.unrole_lock].filter(Boolean)) {
    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.add(role).catch(() => {});
  }
  await api.ensureMember(guild.id, member.id, member.user?.username);
  await api.setMemberStatus(guild.id, member.id, 'Good', null);
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { 'Server Profile Name': displayName }));
  await api.replyOrEdit(interaction, content);

  await sendAuditLog(guild, {
    action: 'Member Reset (Unmuted/Unlocked)',
    executor: interaction.user,
    target: member.user,
    color: '#2ecc71'
  });

  const updatedProfile = await api.getMember(guild.id, member.id).catch(() => null);
  return { updatedProfile, targetId: member.id };
}
