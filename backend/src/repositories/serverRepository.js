import { getSupabase, getSchema } from '../config/supabase.js';

const TABLE = 'servers';
const COLS = 'server_id, time_warn, time_mute, time_lock, time_new, role_warn, role_mute, role_lock, role_new, unrole_mute, unrole_lock';

function rowToServer(row) {
    if (!row) return null;
    return {
        server_id: row.server_id,
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
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).select(COLS).eq('server_id', serverId).maybeSingle();
    if (error) throw error;
    return rowToServer(data);
}

export async function ensure(serverId) {
    const existing = await getById(serverId);
    if (existing) return existing;
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).insert({
        server_id: serverId,
        time_warn: 0,
        time_mute: 0,
        time_lock: 0,
        time_new: 0,
    }).select(COLS).single();
    if (error) throw error;
    return rowToServer(data);
}

export async function update(serverId, payload) {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).update({ ...payload, updated_at: new Date().toISOString() }).eq('server_id', serverId).select(COLS).single();
    if (error) throw error;
    return rowToServer(data);
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
