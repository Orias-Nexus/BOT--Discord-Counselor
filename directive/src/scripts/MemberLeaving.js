import * as api from '../api.js';

/**
 * Event MemberLeaved (GuildMemberRemove): đặt status Leaved cho member vừa rời.
 * Không ghi đè nếu đang là Kick (chỉ ghi đè khi user vào lại server → MemberGreeting set Newbie).
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
}
