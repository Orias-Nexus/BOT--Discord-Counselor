import { getSupabase, getSchema } from '../config/supabase.js';

const TABLE = 'channels';
const COLS = 'category_id, category_type, server_id, channels_idx';

function rowToChannel(row) {
  if (!row) return null;
  return {
    category_id: row.category_id,
    category_type: row.category_type,
    server_id: row.server_id,
    channels_idx: Number(row.channels_idx) ?? 0,
  };
}

export async function listByServer(serverId, categoryType = null) {
  const sb = getSupabase();
  let q = sb.schema(getSchema()).from(TABLE).select(COLS).eq('server_id', serverId);
  if (categoryType) q = q.eq('category_type', categoryType);
  const { data, error } = await q.order('category_type');
  if (error) throw error;
  return (data ?? []).map(rowToChannel);
}

export async function getByCategoryId(categoryId) {
  const sb = getSupabase();
  const { data, error } = await sb.schema(getSchema()).from(TABLE).select(COLS).eq('category_id', categoryId).maybeSingle();
  if (error) throw error;
  return rowToChannel(data);
}

export async function upsert(categoryId, serverId, categoryType, channelsIdx = 0) {
  const sb = getSupabase();
  const payload = {
    category_id: categoryId,
    server_id: serverId,
    category_type: categoryType,
    channels_idx: channelsIdx,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sb.schema(getSchema()).from(TABLE).upsert(payload, { onConflict: 'category_id' }).select(COLS).single();
  if (error) throw error;
  return rowToChannel(data);
}

export async function deleteByCategoryId(categoryId) {
  const sb = getSupabase();
  const { error } = await sb.schema(getSchema()).from(TABLE).delete().eq('category_id', categoryId);
  if (error) throw error;
}

export async function deleteStatsByServerId(serverId) {
  const sb = getSupabase();
  const { data, error } = await sb.schema(getSchema()).from(TABLE).delete().eq('server_id', serverId).eq('category_type', 'Stats').select('category_id');
  if (error) throw error;
  return data?.length ?? 0;
}
