const { createClient } = require('@supabase/supabase-js');
const ENV = require('../../env.js');

let supabase = null;

function getSupabase() {
    if (!supabase) {
        if (!ENV.SUPABASE_URL || !ENV.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY phải được cấu hình trong .env');
        }
        supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY);
    }
    return supabase;
}

module.exports = { getSupabase };
