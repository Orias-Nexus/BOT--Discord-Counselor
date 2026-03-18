import * as api from '../api.js';
import { sendEventMessage } from '../eventMessages.js';

/**
 * Event MemberLeaved (GuildMemberRemove): set status Leaved. Send leaving message to configured channel.
 * Do not overwrite if status is Kick (overwrite only when user rejoins → MemberGreeting set Newbie).
 */
export async function run(interaction, client, actionContext) {
  const guild = actionContext?.guild ?? null;
  const member = actionContext?.member ?? null;
  if (!guild || !member) return;
  const userId = member.id ?? member.user?.id;
  if (!userId) return;
  await api.ensureServer(guild.id);
  const existing = await api.getMember(guild.id, userId).catch(() => null);
  if (existing?.member_status === 'Kick') return;
  await api.ensureMember(guild.id, userId, member.user?.username ?? 'User');
  await api.setMemberStatus(guild.id, userId, 'Leaved', null);
  await sendEventMessage(guild, 'Leaving', { member, guild });
}
