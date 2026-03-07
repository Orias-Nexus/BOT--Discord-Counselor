import * as api from '../api.js';

/**
 * Event MemberJoined (GuildMemberAdd): thêm bản ghi member, gắn role_new, đặt status Newbie.
 * Hiện không gửi tin nhắn chào mừng.
 */
export async function run(interaction, client, actionContext) {
  const guild = actionContext?.guild ?? null;
  const member = actionContext?.member ?? null;
  if (!guild || !member) return;
  await api.ensureServer(guild.id);
  await api.ensureMember(guild.id, member.id, member.user?.username ?? 'User');
  await api.setMemberStatus(guild.id, member.id, 'Newbie', null);
  const server = await api.getServer(guild.id).catch(() => null);
  if (server?.role_new) {
    const role = guild.roles.cache.get(server.role_new);
    if (role) await member.roles.add(role).catch(() => {});
  }
}
