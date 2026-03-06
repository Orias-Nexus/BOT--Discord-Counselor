const { getSupabase } = require('./supabase.js');

const TABLE = 'server_profiles';

/**
 * Lấy profile server (guild_id, name, link, time_warn, time_mute, time_lock).
 * @param {string} guildId
 * @returns {Promise<{ guild_id: string, name: string, link: string | null, time_warn: number, time_mute: number, time_lock: number } | null>}
 */
async function getServerProfile(guildId) {
    const sb = getSupabase();
    const { data, error } = await sb
        .from(TABLE)
        .select('guild_id, name, link, time_warn, time_mute, time_lock')
        .eq('guild_id', guildId)
        .maybeSingle();

    if (error) {
        console.error('[serverProfileDb] getServerProfile:', error);
        return null;
    }
    return data ?? null;
}

/**
 * Đảm bảo server có bản ghi; nếu chưa thì tạo với time_warn=0, time_mute=0, time_lock=0.
 * @param {string} guildId
 * @returns {Promise<{ guild_id: string, name: string, link: string | null, time_warn: number, time_mute: number, time_lock: number }>}
 */
async function ensureServerProfile(guildId) {
    const existing = await getServerProfile(guildId);
    if (existing) return existing;

    const sb = getSupabase();
    const { data, error } = await sb
        .from(TABLE)
        .insert({
            guild_id: guildId,
            name: 'Server',
            link: null,
            time_warn: 0,
            time_mute: 0,
            time_lock: 0,
        })
        .select('guild_id, name, link, time_warn, time_mute, time_lock')
        .single();

    if (error) {
        console.error('[serverProfileDb] ensureServerProfile:', error);
        return { guild_id: guildId, name: 'Server', link: null, time_warn: 0, time_mute: 0, time_lock: 0 };
    }
    return data;
}

/**
 * Đặt tên server trong DB.
 * @param {string} guildId
 * @param {string} name
 */
async function setName(guildId, name) {
    const sb = getSupabase();
    await ensureServerProfile(guildId);
    const { error } = await sb
        .from(TABLE)
        .update({ name: String(name).trim() || 'Server' })
        .eq('guild_id', guildId);
    if (error) {
        console.error('[serverProfileDb] setName:', error);
        throw error;
    }
}

/**
 * Lấy số phút theo loại phạt. 0 hoặc null = vĩnh viễn.
 * @param {string} guildId
 * @param {'Warning'|'Muted'|'Locked'} type
 * @returns {Promise<number|null>}
 */
async function getTimeForStatus(guildId, type) {
    const data = await getServerProfile(guildId);
    if (!data) return null;
    const key = type === 'Warning' ? 'time_warn' : type === 'Muted' ? 'time_mute' : 'time_lock';
    const n = Number(data[key]);
    if (Number.isNaN(n) || n <= 0) return null;
    return n;
}

/**
 * Lấy cả 3 thời gian (phút). 0 = vĩnh viễn.
 * @param {string} guildId
 * @returns {Promise<{ time_warn: number, time_mute: number, time_lock: number }>}
 */
async function getTimes(guildId) {
    const data = await ensureServerProfile(guildId);
    return {
        time_warn: Number(data.time_warn) || 0,
        time_mute: Number(data.time_mute) || 0,
        time_lock: Number(data.time_lock) || 0,
    };
}

/**
 * Cập nhật cả 3 thời gian (phút). null hoặc <= 0 = vĩnh viễn (lưu 0).
 * @param {string} guildId
 * @param {{ time_warn?: number|null, time_mute?: number|null, time_lock?: number|null }} obj
 */
async function setTimes(guildId, obj) {
    const sb = getSupabase();
    await ensureServerProfile(guildId);
    const payload = {};
    if (obj.time_warn !== undefined) payload.time_warn = obj.time_warn != null && obj.time_warn > 0 ? obj.time_warn : 0;
    if (obj.time_mute !== undefined) payload.time_mute = obj.time_mute != null && obj.time_mute > 0 ? obj.time_mute : 0;
    if (obj.time_lock !== undefined) payload.time_lock = obj.time_lock != null && obj.time_lock > 0 ? obj.time_lock : 0;
    if (Object.keys(payload).length === 0) return;
    const { error } = await sb.from(TABLE).update(payload).eq('guild_id', guildId);
    if (error) {
        console.error('[serverProfileDb] setTimes:', error);
        throw error;
    }
}

/** @deprecated Dùng getTimeForStatus hoặc getTimes. Giữ để tương thích. */
async function getTime(guildId) {
    const t = await getTimes(guildId);
    return t.time_mute > 0 ? t.time_mute : null;
}

/** @deprecated Dùng setTimes. Giữ để tương thích. */
async function setTime(guildId, minutes) {
    await setTimes(guildId, { time_mute: minutes, time_lock: minutes, time_warn: minutes });
}

/**
 * Lưu link mời.
 * @param {string} guildId
 * @param {string | null} link
 */
async function setLink(guildId, link) {
    const sb = getSupabase();
    const { error } = await sb.from(TABLE).update({ link: link || null }).eq('guild_id', guildId);
    if (error) console.error('[serverProfileDb] setLink:', error);
}

module.exports = {
    getServerProfile,
    ensureServerProfile,
    setName,
    getTimeForStatus,
    getTimes,
    setTimes,
    getTime,
    setTime,
    setLink,
};
