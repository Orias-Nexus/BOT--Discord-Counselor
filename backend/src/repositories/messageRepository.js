import { getSupabase, getSchema } from '../config/supabase.js';

const TABLE = 'messages';
const COLS = 'messages_id, messages_type, server_id, channel_id, embed_id';

function rowToMessage(row) {
    if (!row) return null;
    return {
        messages_id: row.messages_id,
        messages_type: row.messages_type,
        server_id: row.server_id,
        channel_id: row.channel_id ?? '0',
        embed_id: row.embed_id ?? null,
    };
}

export async function listByServer(serverId) {
    const sb = getSupabase();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).select(COLS).eq('server_id', serverId).order('messages_type');
    if (error) throw error;
    return (data ?? []).map(rowToMessage);
}

export async function getByServerAndType(serverId, messagesType) {
    const sb = getSupabase();
    const { data, error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .select(COLS)
        .eq('server_id', serverId)
        .eq('messages_type', messagesType)
        .maybeSingle();
    if (error) throw error;
    return rowToMessage(data);
}

export async function setChannel(serverId, messagesType, channelId) {
    const existing = await getByServerAndType(serverId, messagesType);
    const sb = getSupabase();
    const payload = { channel_id: channelId ?? null, updated_at: new Date().toISOString() };
    if (existing) {
        const { data, error } = await sb
            .schema(getSchema())
            .from(TABLE)
            .update(payload)
            .eq('messages_id', existing.messages_id)
            .select(COLS)
            .single();
        if (error) throw error;
        return rowToMessage(data);
    }
    const { data, error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .insert({ server_id: serverId, messages_type: messagesType, channel_id: channelId ?? null })
        .select(COLS)
        .single();
    if (error) throw error;
    return rowToMessage(data);
}

export async function setEmbed(serverId, messagesType, embedId) {
    const existing = await getByServerAndType(serverId, messagesType);
    const sb = getSupabase();
    const payload = { embed_id: embedId ?? null, updated_at: new Date().toISOString() };
    if (existing) {
        const { data, error } = await sb
            .schema(getSchema())
            .from(TABLE)
            .update(payload)
            .eq('messages_id', existing.messages_id)
            .select(COLS)
            .single();
        if (error) throw error;
        return rowToMessage(data);
    }
    const { data, error } = await sb
        .schema(getSchema())
        .from(TABLE)
        .insert({ server_id: serverId, messages_type: messagesType, channel_id: null, embed_id: embedId ?? null })
        .select(COLS)
        .single();
    if (error) throw error;
    return rowToMessage(data);
}

const MESSAGE_TYPES_FOR_NEW_SERVER = ['Greeting', 'Leaving', 'Boosting'];

/** Tạo 3 bản ghi messages (Greeting, Leaving, Boosting) cho server mới nếu chưa có. */
export async function ensureMessagesForServer(serverId) {
    const sb = getSupabase();
    for (const messagesType of MESSAGE_TYPES_FOR_NEW_SERVER) {
        const existing = await getByServerAndType(serverId, messagesType);
        if (existing) continue;
        const { error } = await sb
            .schema(getSchema())
            .from(TABLE)
            .insert({ server_id: serverId, messages_type: messagesType, channel_id: null, embed_id: null });
        if (error) throw error;
    }
    return listByServer(serverId);
}
