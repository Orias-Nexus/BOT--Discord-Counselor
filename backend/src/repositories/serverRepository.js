import { prisma } from '../config/prisma.js';

function rowToServer(row) {
    if (!row) return null;
    return {
        server_id: row.server_id,
        status: row.status,
        time_warn: Number(row.time_warn) ?? 0,
        time_mute: Number(row.time_mute) ?? 0,
        time_lock: Number(row.time_lock) ?? 0,
        time_new: Number(row.time_new) ?? 0,
        role_warn: row.role_warn ?? null,
        role_mute: row.role_mute ?? null,
        role_lock: row.role_lock ?? null,
        role_new: row.role_new ?? null,
        unrole_mute: row.unrole_mute ?? null,
        unrole_lock: row.unrole_lock ?? null,
    };
}

export async function getById(serverId) {
    const row = await prisma.servers.findUnique({
        where: { server_id: serverId }
    });
    return rowToServer(row);
}

export async function getStats(serverId) {
    const [memberCount, channelCount] = await Promise.all([
        prisma.members.count({ where: { server_id: serverId } }),
        prisma.channels.count({ where: { server_id: serverId } })
    ]);
    return {
        total_members: memberCount,
        configured_channels: channelCount
    };
}

export async function ensure(serverId) {
    const row = await prisma.servers.upsert({
        where: { server_id: serverId },
        update: {},
        create: {
            server_id: serverId,
            time_warn: 0,
            time_mute: 0,
            time_lock: 0,
            time_new: 0,
        }
    });
    return rowToServer(row);
}

export async function update(serverId, payload) {
    const row = await prisma.servers.update({
        where: { server_id: serverId },
        data: {
            ...payload,
            updated_at: new Date()
        }
    });
    return rowToServer(row);
}

export async function setTimes(serverId, { time_warn, time_mute, time_lock, time_new }) {
    const p = {};
    if (time_warn !== undefined) p.time_warn = time_warn != null && time_warn > 0 ? time_warn : 0;
    if (time_mute !== undefined) p.time_mute = time_mute != null && time_mute > 0 ? time_mute : 0;
    if (time_lock !== undefined) p.time_lock = time_lock != null && time_lock > 0 ? time_lock : 0;
    if (time_new !== undefined) p.time_new = time_new != null && time_new > 0 ? time_new : 0;
    if (Object.keys(p).length === 0) return getById(serverId);
    return update(serverId, p);
}

export async function setRoles(serverId, { role_warn, role_mute, role_lock, role_new }) {
    const p = {};
    if (role_warn !== undefined) p.role_warn = role_warn ?? null;
    if (role_mute !== undefined) p.role_mute = role_mute ?? null;
    if (role_lock !== undefined) p.role_lock = role_lock ?? null;
    if (role_new !== undefined) p.role_new = role_new ?? null;
    if (Object.keys(p).length === 0) return getById(serverId);
    return update(serverId, p);
}

export async function setUnroles(serverId, { unrole_mute, unrole_lock }) {
    const p = {};
    if (unrole_mute !== undefined) p.unrole_mute = unrole_mute ?? null;
    if (unrole_lock !== undefined) p.unrole_lock = unrole_lock ?? null;
    if (Object.keys(p).length === 0) return getById(serverId);
    return update(serverId, p);
}
