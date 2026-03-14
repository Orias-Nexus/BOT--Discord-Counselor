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

/** Gọi GET member để đảm bảo user/member tồn tại (backend ensure). Tham số thứ 3 không dùng. */
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

export async function getFunction(scriptName) {
  return request(`/api/functions/script/${encodeURIComponent(scriptName)}`);
}

export async function getSlashList() {
  return request('/api/functions/slash');
}

/** Discord API: token interaction hết hạn hoặc đã dùng — không gọi reply/editReply/followUp nữa trên interaction đó. */
export const UNKNOWN_INTERACTION_CODE = 10062;

export function isUnknownInteraction(err) {
  return err?.code === UNKNOWN_INTERACTION_CODE;
}

/** Trả lời interaction (replyType ephemeral): dùng editReply nếu đã defer, reply nếu chưa. Ephemeral = chỉ mình thấy, có thể dismiss. */
export async function replyOrEdit(interaction, content, payload = {}) {
  if (interaction.deferred) return interaction.editReply({ content, ...payload }).catch(() => {});
  return interaction.reply({ content, flags: MessageFlags.Ephemeral, ...payload }).catch(() => {});
}

/** Chuẩn hóa nội dung gửi kèm flag Ephemeral. Discord tự hiển thị dạng "Only you can see this • Dismiss", không cần thêm vào content. */
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
