import * as api from '../api.js';

/**
 * Event MemberLeaved (GuildMemberRemove): đặt status Leaved cho member vừa rời.
 * Hiện không gửi tin nhắn tạm biệt.
 */
export async function run(interaction, client, actionContext) {
  const guild = actionContext?.guild ?? null;
  const member = actionContext?.member ?? null;
  if (!guild || !member) return;
  const userId = member.id ?? member.user?.id;
  if (!userId) return;
  await api.ensureServer(guild.id);
  await api.ensureMember(guild.id, userId, member.user?.username ?? 'User');
  await api.setMemberStatus(guild.id, userId, 'Leaved', null);
}
