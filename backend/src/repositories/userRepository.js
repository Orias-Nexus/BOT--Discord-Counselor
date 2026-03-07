import { getSupabase, getSchema } from '../config/supabase.js';

const TABLE = 'users';

export async function getById(userId) {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data;
}

export async function ensure(userId) {
    const existing = await getById(userId);
    if (existing) return existing;
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).insert({ user_id: userId, user_exp: 0, user_level: 0 }).select().single();
    if (error) {
        if (error.code === '23505') return getById(userId);
        throw error;
    }
    return data;
}
