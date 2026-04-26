import * as api from '../api.js';
import { sendAuditLog } from '../utils/auditLogger.js';

const SUCCESS_MESSAGE = "{Server Profile Name}'s Status is Muted until {Member Expires} - UTC.";
const FAIL_MESSAGE = "Cannot mute {Server Profile Name}. Make sure the bot's role is above theirs and you have permission.";

/**
 * Core mute logic — shared by slash commands and web dashboard.
 * @param {{ guild: import('discord.js').Guild, member: import('discord.js').GuildMember, server: object, executorUser?: import('discord.js').User|null }} params
 * @returns {Promise<{ ok: boolean, resultMeta?: object, error?: string }>}
 */
export async function execute({ guild, member, server, executorUser = null }) {
  const timeMute = server?.time_mute > 0 ? server.time_mute : null;
  const expiresAt = timeMute ? new Date(Date.now() + timeMute * 60 * 1000) : null;

  for (const roleId of [server?.role_warn, server?.role_lock, server?.unrole_mute, server?.role_new].filter(Boolean)) {
    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.remove(role).catch(() => {});
  }

  if (server?.role_mute) {
    const role = guild.roles.cache.get(server.role_mute);
    if (role) {
      const err = await member.roles.add(role).then(() => null).catch((e) => e);
      if (err) return { ok: false, error: 'Failed to add mute role — check bot permissions.' };
    }
  }

  if (server?.unrole_lock) {
    const role = guild.roles.cache.get(server.unrole_lock);
    if (role) await member.roles.add(role).catch(() => {});
  }

  await api.ensureMember(guild.id, member.id, member.user?.username);
  await api.setMemberStatus(guild.id, member.id, 'Mute', expiresAt);

  const expiresStr = expiresAt ? expiresAt.toLocaleString('en-US') : 'permanent';

  await sendAuditLog(guild, {
    action: 'Member Muted',
    executor: executorUser,
    target: member.user,
    color: '#e74c3c',
    fields: [{ name: 'Expires', value: expiresStr }],
  });

  const updatedProfile = await api.getMember(guild.id, member.id).catch(() => null);
  return { ok: true, resultMeta: { expiresAt, expiresStr, targetId: member.id, updatedProfile } };
}

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

  const result = await execute({ guild, member, server, executorUser: interaction.user });

  if (!result.ok) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent(api.replacePlaceholders(FAIL_MESSAGE, { 'Server Profile Name': displayName })));
    return;
  }

  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, {
    'Server Profile Name': displayName,
    'Member Expires': result.resultMeta.expiresStr,
  }));
  await api.replyOrEdit(interaction, content);

  return { updatedProfile: result.resultMeta.updatedProfile, targetId: member.id };
}
