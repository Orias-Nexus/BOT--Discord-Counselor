import { getSupabase, getSchema } from '../config/supabase.js';

const TABLE = 'embeds';
const COLS = 'embed_id, embed_name, server_id, embed';

function rowToEmbed(row) {
    if (!row) return null;
    return {
        embed_id: row.embed_id,
        embed_name: row.embed_name,
        server_id: row.server_id,
        embed: row.embed ?? null,
    };
}

export async function listByServer(serverId) {
    const sb = getSupabase();
    const { data, error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .select(COLS)
        .eq('server_id', serverId)
        .order('embed_name');
    if (error) throw error;
    return (data ?? []).map(rowToEmbed);
}

export async function getById(serverId, embedId) {
    const sb = getSupabase();
    const { data, error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .select(COLS)
        .eq('server_id', serverId)
        .eq('embed_id', embedId)
        .maybeSingle();
    if (error) throw error;
    return rowToEmbed(data);
}

export async function getByName(serverId, embedName) {
    const sb = getSupabase();
    const { data, error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .select(COLS)
        .eq('server_id', serverId)
        .eq('embed_name', embedName)
        .maybeSingle();
    if (error) throw error;
    return rowToEmbed(data);
}

export async function create(serverId, embedName, embedData) {
    const sb = getSupabase();
    const { data, error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .insert({
            server_id: serverId,
            embed_name: embedName,
            embed: embedData ?? null,
        })
        .select(COLS)
        .single();
    if (error) throw error;
    return rowToEmbed(data);
}

export async function update(serverId, embedId, payload) {
    const sb = getSupabase();
    const { embed_name, embed } = payload;
    const updatePayload = { updated_at: new Date().toISOString() };
    if (embed_name !== undefined) updatePayload.embed_name = embed_name;
    if (embed !== undefined) updatePayload.embed = embed;
    const { data, error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .update(updatePayload)
        .eq('server_id', serverId)
        .eq('embed_id', embedId)
        .select(COLS)
        .single();
    if (error) throw error;
    return rowToEmbed(data);
}

export async function remove(serverId, embedId) {
    const sb = getSupabase();
    const { error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .delete()
        .eq('server_id', serverId)
        .eq('embed_id', embedId);
    if (error) throw error;
}
