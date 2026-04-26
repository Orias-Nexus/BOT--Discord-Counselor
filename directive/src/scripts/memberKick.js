import * as api from '../api.js';
import { sendAuditLog } from '../utils/auditLogger.js';

const SUCCESS_MESSAGE = "{Server Profile Name} has been Kicked.";
const FAIL_MESSAGE = "Cannot kick {Server Profile Name}. Make sure the bot's role is above theirs and you have permission.";

/**
 * Core kick logic — shared by slash commands and web dashboard.
 * @param {{ guild: import('discord.js').Guild, member: import('discord.js').GuildMember, executorUser?: import('discord.js').User|null, reason?: string }} params
 * @returns {Promise<{ ok: boolean, resultMeta?: object, error?: string }>}
 */
export async function execute({ guild, member, executorUser = null, reason = 'Counselor moderation' }) {
  const kickError = await member.kick(reason).then(() => null).catch((e) => e);
  if (kickError) return { ok: false, error: 'Failed to kick — check bot permissions.' };

  await api.ensureMember(guild.id, member.id, member.user?.username);
  await api.setMemberStatus(guild.id, member.id, 'Kick', null);

  await sendAuditLog(guild, {
    action: 'Member Kicked',
    executor: executorUser,
    target: member.user,
    color: '#e74c3c',
  });

  return { ok: true, resultMeta: { targetId: member.id, username: member.user?.username } };
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

  const displayName = member.displayName ?? member.user?.username ?? 'User';
  const result = await execute({ guild, member, executorUser: interaction.user });

  if (!result.ok) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent(api.replacePlaceholders(FAIL_MESSAGE, { 'Server Profile Name': displayName })));
    return;
  }

  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { 'Server Profile Name': displayName }));
  await api.replyOrEdit(interaction, content);
}
