import { getSupabase, getSchema } from '../config/supabase.js';

const TABLE = 'levels';

export async function getAll() {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).select('level, exp').order('level', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function getByLevel(level) {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).select('level, exp').eq('level', Number(level)).maybeSingle();
    if (error) throw error;
    return data;
}

export async function getMinMax() {
    const all = await getAll();
    if (all.length === 0) return { min: 0, max: 0 };
    return { min: all[0].level, max: all[all.length - 1].level };
}
