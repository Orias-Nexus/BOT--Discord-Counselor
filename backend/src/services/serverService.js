import * as serverRepo from '../repositories/serverRepository.js';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache.js';

const SERVER_TTL = 300;
const serverKey = (id) => `server:${id}`;

export async function getServer(serverId) {
    const cached = await cacheGet(serverKey(serverId));
    if (cached) return cached;
    const server = await serverRepo.getById(serverId);
    if (server) await cacheSet(serverKey(serverId), server, SERVER_TTL);
    return server;
}

export async function getStats(serverId) {
    const cachedStats = await cacheGet(`server:stats:${serverId}`);
    if (cachedStats) return cachedStats;
    const stats = await serverRepo.getStats(serverId);
    await cacheSet(`server:stats:${serverId}`, stats, 60); // cache 1 minute
    return stats;
}

/** Create server if missing. DB trigger creates 3 messages (Greeting, Leaving, Boosting). */
export async function ensureServer(serverId) {
    const server = await serverRepo.ensure(serverId);
    await cacheSet(serverKey(serverId), server, SERVER_TTL);
    return server;
}

export async function getTimes(serverId) {
    const s = await ensureServer(serverId);
    return { time_warn: s.time_warn, time_mute: s.time_mute, time_lock: s.time_lock, time_new: s.time_new };
}

export async function setTimes(serverId, { time_warn, time_mute, time_lock, time_new }) {
    await ensureServer(serverId);
    const server = await serverRepo.setTimes(serverId, { time_warn, time_mute, time_lock, time_new });
    await cacheSet(serverKey(serverId), server, SERVER_TTL);
    return server;
}

export async function setRoles(serverId, { role_warn, role_mute, role_lock, role_new }) {
    await ensureServer(serverId);
    const server = await serverRepo.setRoles(serverId, { role_warn, role_mute, role_lock, role_new });
    await cacheSet(serverKey(serverId), server, SERVER_TTL);
    return server;
}

export async function setUnroles(serverId, { unrole_mute, unrole_lock }) {
    await ensureServer(serverId);
    const server = await serverRepo.setUnroles(serverId, { unrole_mute, unrole_lock });
    await cacheSet(serverKey(serverId), server, SERVER_TTL);
    return server;
}
