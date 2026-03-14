import { createClient } from '@supabase/supabase-js';

const SCHEMA = 'DiscordCounselor';
let client = null;

export function getSupabase() {
    if (!client) {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) throw new Error('SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY phải được cấu hình');
        client = createClient(url, key);
    }
    return client;
}

export function getSchema() {
    return SCHEMA;
}
