import * as api from '../api.js';
import { buildMemberInfoPayload, findAndUpdateMemberInfoInGuild } from '../actions/embedUpdate.js';
import { BACKEND_API_URL } from '../config.js';
import { sendAuditLog } from '../utils/auditLogger.js';

const INTERVAL_MS = 6 * 60 * 1000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

function isTransientBackendError(err) {
  const code = err?.cause?.code ?? err?.code;
  const msg = err?.message ?? String(err);
  const isAbort = err?.name === 'AbortError';
  return (
    isAbort ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    msg === 'fetch failed'
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Apply roles like Good (MemberReset): remove role_warn/mute/lock; add unrole_mute, unrole_lock. No message sent.
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
 * Update Member Info embed (if message exists for that member) after expires sets Good.
 */
async function updateMemberInfoEmbedIfExists(client, serverId, userId) {
  const guild = client.guilds.cache.get(serverId);
  if (!guild) return;
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return;
  const profile = await api.getMember(serverId, userId).catch(() => null);
  const payload = await buildMemberInfoPayload(member, profile);
  await findAndUpdateMemberInfoInGuild(client, serverId, userId, payload);
}

export function startExpiresCheck(client) {
  async function run() {
    let lastErr;
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const { count, updated = [] } = await api.processExpires();
        if (count === 0) return;
        for (const { server_id, user_id } of updated) {
          await applyGoodRoles(client, server_id, user_id);
          await updateMemberInfoEmbedIfExists(client, server_id, user_id);

          const guild = client.guilds.cache.get(server_id);
          if (guild) {
             const targetUser = await client.users.fetch(user_id).catch(() => null);
             await sendAuditLog(guild, {
               action: 'Status Expired (Automated)',
               target: targetUser || user_id,
               reason: 'Mute/Lock duration finished',
               color: '#2ecc71'
             });
          }
        }
        return;
      } catch (err) {
        lastErr = err;
        if (attempt < RETRY_ATTEMPTS && isTransientBackendError(err)) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        break;
      }
    }
    if (!lastErr) return;
    const code = lastErr?.cause?.code ?? lastErr?.code;
    const msg = lastErr?.message ?? String(lastErr);
    if (isTransientBackendError(lastErr)) {
      console.warn(
        `[expiresCheck] Backend not responding after ${RETRY_ATTEMPTS} attempts. ` +
          `Check backend is running and BACKEND_API_URL in .env. Current BACKEND_API_URL=${BACKEND_API_URL ?? 'unknown'}`
      );
    } else {
      console.warn('[expiresCheck]', msg, code ? `(${code})` : '');
    }
  }
  run();
  setInterval(run, INTERVAL_MS);
}
