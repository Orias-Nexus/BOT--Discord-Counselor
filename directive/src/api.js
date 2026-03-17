import { MessageFlags } from 'discord.js';
import { BACKEND_API_URL } from './config.js';

async function request(path, options = {}) {
  const url = BACKEND_API_URL + path;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export async function getServer(serverId) {
  try {
    return await request(`/api/servers/${serverId}`);
  } catch (err) {
    if (err.message && (err.message.includes('404') || err.message.includes('not found'))) return null;
    throw err;
  }
}

export async function ensureServer(serverId) {
  return request(`/api/servers/${serverId}/ensure`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function updateServer(serverId, body) {
  return request(`/api/servers/${serverId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function getTimes(serverId) {
  return request(`/api/servers/${serverId}/times`);
}

export async function setTimes(serverId, body) {
  return request(`/api/servers/${serverId}/times`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function setRoles(serverId, body) {
  return request(`/api/servers/${serverId}/roles`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function setUnroles(serverId, body) {
  return request(`/api/servers/${serverId}/unroles`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function getMember(serverId, userId) {
  return request(`/api/members/${serverId}/${userId}`);
}

/** GET member to ensure user/member exists (backend ensure). Third param unused. */
export async function ensureMember(serverId, userId) {
  return request(`/api/members/${serverId}/${userId}`);
}

export async function setMemberLevel(serverId, userId, level) {
  return request(`/api/members/${serverId}/${userId}/level`, {
    method: 'PATCH',
    body: JSON.stringify({ level }),
  });
}

export async function setMemberStatus(serverId, userId, status, expiresAt) {
  return request(`/api/members/${serverId}/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, expiresAt: expiresAt ?? null }),
  });
}

export async function getChannels(serverId, channelType = null) {
  const path = channelType
    ? `/api/servers/${encodeURIComponent(serverId)}/channels?type=${encodeURIComponent(channelType)}`
    : `/api/servers/${encodeURIComponent(serverId)}/channels`;
  return request(path);
}

export async function upsertChannel(serverId, categoryId, categoryType, channelsIdx = 0) {
  return request(`/api/servers/${encodeURIComponent(serverId)}/channels`, {
    method: 'POST',
    body: JSON.stringify({
      category_id: categoryId,
      category_type: categoryType,
      channels_idx: channelsIdx,
    }),
  });
}

export async function deleteServerStatChannels(serverId) {
  return request(`/api/servers/${encodeURIComponent(serverId)}/channels/stats`, { method: 'DELETE' });
}

export async function getFunction(scriptName) {
  return request(`/api/functions/script/${encodeURIComponent(scriptName)}`);
}

export async function getSlashList() {
  return request('/api/functions/slash');
}

/** Discord API: interaction token expired or already used — do not call reply/editReply/followUp again. */
export const UNKNOWN_INTERACTION_CODE = 10062;

export function isUnknownInteraction(err) {
  return err?.code === UNKNOWN_INTERACTION_CODE;
}

/** Reply to interaction (ephemeral): use editReply if deferred, else reply. Ephemeral = only visible to user, dismissible. */
export async function replyOrEdit(interaction, content, payload = {}) {
  if (interaction.deferred) return interaction.editReply({ content, ...payload }).catch(() => {});
  return interaction.reply({ content, flags: MessageFlags.Ephemeral, ...payload }).catch(() => {});
}

/** Normalize content for Ephemeral flag. Discord shows "Only you can see this • Dismiss" automatically. */
export function formatEphemeralContent(content) {
  if (content == null || content === '') return '';
  return String(content).trim();
}

export function replacePlaceholders(content, vars) {
  if (typeof content !== 'string') return content;
  let out = content;
  for (const [key, value] of Object.entries(vars ?? {})) {
    const placeholder = typeof value === 'string' ? value : String(value ?? '');
    out = out.replace(new RegExp(`\\{${key}\\}`, 'g'), placeholder);
  }
  return out;
}

export async function getLevelRange() {
  return request('/api/members/level-range');
}

/** Backend: process expired members (set Good). Returns { count, updated: [{ server_id, user_id }] }. */
export async function processExpires() {
  return request('/api/members/process-expires', { method: 'POST' });
}

/** Server messages list (Greeting, Leaving, Boosting, ...). */
export async function listMessages(serverId) {
  try {
    const data = await request(`/api/servers/${serverId}/messages`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err?.message?.includes('404') || err?.message?.includes('not found')) return [];
    throw err;
  }
}

/** Get message config by type (Greeting, Leaving, Boosting). Backend must mount message routes. */
export async function getMessageByType(serverId, messagesType) {
  try {
    return await request(`/api/servers/${serverId}/messages/${messagesType}`);
  } catch (err) {
    if (err?.message?.includes('404') || err?.message?.includes('not found')) return null;
    throw err;
  }
}

export async function setMessageChannel(serverId, messagesType, channelId) {
  return request(`/api/servers/${serverId}/messages/${messagesType}/channel`, {
    method: 'PATCH',
    body: JSON.stringify({ channel_id: channelId ?? null }),
  });
}

export async function setMessageEmbed(serverId, messagesType, embedId) {
  return request(`/api/servers/${serverId}/messages/${messagesType}/embed`, {
    method: 'PATCH',
    body: JSON.stringify({ embed_id: embedId ?? null }),
  });
}

/** Server embed list. */
export async function listEmbeds(serverId) {
  try {
    const data = await request(`/api/servers/${serverId}/embeds`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err?.message?.includes('404') || err?.message?.includes('not found')) return [];
    throw err;
  }
}

/** Get embed by id (server_id + embed_id). */
export async function getEmbed(serverId, embedId) {
  try {
    return await request(`/api/servers/${serverId}/embeds/${embedId}`);
  } catch (err) {
    if (err?.message?.includes('404') || err?.message?.includes('not found')) return null;
    throw err;
  }
}

/** Create new embed. */
export async function createEmbed(serverId, embedName, embedData) {
  return request(`/api/servers/${serverId}/embeds`, {
    method: 'POST',
    body: JSON.stringify({ embed_name: embedName.trim(), embed: embedData ?? null }),
  });
}

/** Update embed. */
export async function updateEmbed(serverId, embedId, payload) {
  return request(`/api/servers/${serverId}/embeds/${embedId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** Delete embed. */
export async function deleteEmbed(serverId, embedId) {
  return request(`/api/servers/${serverId}/embeds/${embedId}`, {
    method: 'DELETE',
  });
}
