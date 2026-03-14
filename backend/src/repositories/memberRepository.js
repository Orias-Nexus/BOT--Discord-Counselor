import { getSupabase, getSchema } from '../config/supabase.js';
import * as userRepo from './userRepository.js';

const TABLE = 'members';
const COLS = 'user_id, server_id, member_exp, member_level, member_status, member_expires';
const STATUS_API_TO_DB = { Good: 'Good', Warning: 'Warn', Muted: 'Mute', Locked: 'Lock', Newbie: 'Newbie', Leaved: 'leaved' };
const STATUS_DB_TO_API = { Good: 'Good', Warn: 'Warning', Mute: 'Muted', Lock: 'Locked', Kick: 'Kick', leaved: 'Leaved', Newbie: 'Newbie' };

function rowToMember(row) {
    if (!row) return null;
    return {
        user_id: row.user_id,
        server_id: row.server_id,
        member_exp: row.member_exp ?? 0,
        member_level: row.member_level ?? 0,
        member_status: STATUS_DB_TO_API[row.member_status] ?? row.member_status,
        member_expires: row.member_expires ?? null,
    };
}

export async function getByServerAndUser(serverId, userId) {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).select(COLS).eq('server_id', serverId).eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return rowToMember(data);
}

export async function ensure(serverId, userId) {
    await userRepo.ensure(userId);
    const sb = getSupabase();
    await sb.schema(getSchema()).from(TABLE).upsert(
        {
            server_id: serverId,
            user_id: userId,
            member_level: 0,
            member_status: 'Good',
            member_expires: null,
        },
        { onConflict: 'server_id,user_id', ignoreDuplicates: true }
    );
    const existing = await getByServerAndUser(serverId, userId);
    return existing;
}

export async function updateLevel(serverId, userId, memberLevel) {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).update({ member_level: Number(memberLevel), updated_at: new Date().toISOString() }).eq('server_id', serverId).eq('user_id', userId).select(COLS).single();
    if (error) throw error;
    return rowToMember(data);
}

export async function updateStatus(serverId, userId, status, expiresAt = null) {
    const dbStatus = STATUS_API_TO_DB[status] ?? status;
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).update({
        member_status: dbStatus,
        member_expires: expiresAt ? new Date(expiresAt).toISOString() : null,
        updated_at: new Date().toISOString(),
    }).eq('server_id', serverId).eq('user_id', userId).select(COLS).single();
    if (error) throw error;
    return rowToMember(data);
}

/**
 * Đặt Good cho mọi member có member_expires <= now và member_status != 'Good'.
 * Trả về { count, updated: [{ server_id, user_id }, ...] } để directive áp dụng role.
 */
export async function processExpiredMembers() {
    const sb = getSupabase();
    const now = new Date().toISOString();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).update({
        member_status: 'Good',
        member_expires: null,
        updated_at: now,
    }).not('member_expires', 'is', null).lte('member_expires', now).neq('member_status', 'Good').select('user_id, server_id');
    if (error) throw error;
    const updated = (data ?? []).map((r) => ({ server_id: r.server_id, user_id: r.user_id }));
    return { count: updated.length, updated };
}
