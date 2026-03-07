import { getSupabase, getSchema } from '../config/supabase.js';

const TABLE = 'functions';

export async function getByScript(scriptName) {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).select('script, slash, action, embed').eq('script', scriptName).maybeSingle();
    if (error) throw error;
    return data;
}

export async function getAllSlash() {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).select('script, slash').not('slash', 'is', null);
    if (error) throw error;
    return data ?? [];
}
