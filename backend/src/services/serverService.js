import * as serverRepo from '../repositories/serverRepository.js';

export async function getServer(serverId) {
    return serverRepo.getById(serverId);
}

/** Create server if missing. DB trigger creates 3 messages (Greeting, Leaving, Boosting). */
export async function ensureServer(serverId) {
    return serverRepo.ensure(serverId);
}

export async function getTimes(serverId) {
    const s = await serverRepo.ensure(serverId);
    return { time_warn: s.time_warn, time_mute: s.time_mute, time_lock: s.time_lock, time_new: s.time_new };
}

export async function setTimes(serverId, { time_warn, time_mute, time_lock, time_new }) {
    await serverRepo.ensure(serverId);
    return serverRepo.setTimes(serverId, { time_warn, time_mute, time_lock, time_new });
}

export async function setRoles(serverId, { role_warn, role_mute, role_lock, role_new }) {
    await serverRepo.ensure(serverId);
    return serverRepo.setRoles(serverId, { role_warn, role_mute, role_lock, role_new });
}

export async function setUnroles(serverId, { unrole_mute, unrole_lock }) {
    await serverRepo.ensure(serverId);
    return serverRepo.setUnroles(serverId, { unrole_mute, unrole_lock });
}
