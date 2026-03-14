import * as api from '../api.js';
import { buildMemberInfoPayload, findAndUpdateMemberInfoInGuild } from '../actions/embedUpdate.js';

const INTERVAL_MS = 60 * 1000;

/**
 * Áp dụng thao tác role giống khi ấn Good (MemberReset): gỡ role_warn, role_mute, role_lock;
 * thêm unrole_mute, unrole_lock. Không gửi tin nhắn.
 */
async function applyGoodRoles(client, serverId, userId) {
  const guild = client.guilds.cache.get(serverId);
  if (!guild) return;
  const server = await api.getServer(serverId).catch(() => null);
  if (!server) return;
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return;
  for (const roleId of [server.role_warn, server.role_mute, server.role_lock, server.role_new].filter(Boolean)) {
    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.remove(role).catch(() => {});
  }
  for (const roleId of [server.unrole_mute, server.unrole_lock].filter(Boolean)) {
    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.add(role).catch(() => {});
  }
}

/**
 * Cập nhật embed Member Info (nếu có message hiển thị member đó) sau khi expires đặt Good.
 */
async function updateMemberInfoEmbedIfExists(client, serverId, userId) {
  const guild = client.guilds.cache.get(serverId);
  if (!guild) return;
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return;
  const profile = await api.getMember(serverId, userId).catch(() => null);
  const payload = buildMemberInfoPayload(member, profile);
  await findAndUpdateMemberInfoInGuild(client, serverId, userId, payload);
}

export function startExpiresCheck(client) {
  async function run() {
    try {
      const { count, updated = [] } = await api.processExpires();
      if (count === 0) return;
      for (const { server_id, user_id } of updated) {
        await applyGoodRoles(client, server_id, user_id);
        await updateMemberInfoEmbedIfExists(client, server_id, user_id);
      }
    } catch (err) {
      console.warn('[expiresCheck]', err?.message ?? err);
    }
  }
  run();
  setInterval(run, INTERVAL_MS);
}
