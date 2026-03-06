const { getSupabase } = require('./supabase.js');

const TABLE = 'member_profiles';

const STATUS_ENUM = ['Good', 'Warning', 'Muted', 'Locked'];

/**
 * Nếu status có hạn (status_expires_at) mà đã hết hạn thì cập nhật về Good.
 * @returns { Promise<{ user_id, guild_id, level, status, status_expires_at } | null> }
 */
async function ensureExpiredStatusReset(userId, guildId, profile) {
    if (!profile || profile.status === 'Good' || profile.status_expires_at == null) return profile;
    const expiresAt = new Date(profile.status_expires_at);
    if (expiresAt > new Date()) return profile;
    const updated = await updateStatus(userId, guildId, 'Good', null);
    return updated ?? profile;
}

/**
 * Lấy hoặc tạo profile thành viên (user_id + guild_id).
 * Tự động chuyển về Good nếu status_expires_at đã hết hạn.
 * @returns { Promise<{ user_id, guild_id, level, status, status_expires_at } | null> }
 */
async function getProfile(userId, guildId) {
    const sb = getSupabase();
    const { data, error } = await sb
        .from(TABLE)
        .select('user_id, guild_id, level, status, status_expires_at')
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .maybeSingle();

    if (error) {
        console.error('[memberProfilesDb] getProfile:', error);
        return null;
    }
    if (data) return ensureExpiredStatusReset(userId, guildId, data);

    const { data: inserted, error: insertError } = await sb
        .from(TABLE)
        .insert({
            user_id: userId,
            guild_id: guildId,
            level: 0,
            status: 'Good',
            status_expires_at: null,
        })
        .select('user_id, guild_id, level, status, status_expires_at')
        .single();

    if (insertError) {
        console.error('[memberProfilesDb] upsert insert:', insertError);
        return null;
    }
    return inserted;
}

/**
 * Cập nhật level.
 */
async function updateLevel(userId, guildId, level) {
    const sb = getSupabase();
    const { data, error } = await sb
        .from(TABLE)
        .update({
            level: Number(level),
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .select('user_id, guild_id, level, status, status_expires_at')
        .single();

    if (error) {
        console.error('[memberProfilesDb] updateLevel:', error);
        return null;
    }
    return data;
}

/**
 * Cập nhật status và status_expires_at.
 * @param { string } status - Good | Warning | Muted | Locked
 * @param { Date | null } expiresAt - null = vĩnh viễn
 */
async function updateStatus(userId, guildId, status, expiresAt = null) {
    if (!STATUS_ENUM.includes(status)) return null;
    const sb = getSupabase();
    const payload = {
        status,
        status_expires_at: expiresAt ? expiresAt.toISOString() : null,
        updated_at: new Date().toISOString(),
    };
    const { data, error } = await sb
        .from(TABLE)
        .update(payload)
        .eq('user_id', userId)
        .eq('guild_id', guildId)
        .select('user_id, guild_id, level, status, status_expires_at')
        .single();

    if (error) {
        console.error('[memberProfilesDb] updateStatus:', error);
        return null;
    }
    return data;
}

module.exports = {
    getProfile,
    updateLevel,
    updateStatus,
    STATUS_ENUM,
};
