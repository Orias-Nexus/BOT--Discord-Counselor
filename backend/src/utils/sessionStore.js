/**
 * Session store cho Discord OAuth.
 * - Mỗi login tạo một `sessionId` (UUID). JWT chỉ chứa `{ sub, sessionId }`.
 * - Access token & refresh token được lưu ở Redis với TTL 7 ngày.
 * - Logout => xóa session, token cũ trở nên vô hiệu (dù JWT còn hạn).
 */
import { randomUUID } from 'crypto';
import { redisClient } from './redis.js';

const PREFIX = 'session:';
const DEFAULT_TTL = 7 * 24 * 60 * 60;

const key = (sessionId) => `${PREFIX}${sessionId}`;

export async function createSession(payload, ttlSeconds = DEFAULT_TTL) {
  const sessionId = randomUUID();
  await redisClient.set(key(sessionId), JSON.stringify(payload), 'EX', ttlSeconds);
  return sessionId;
}

export async function getSession(sessionId) {
  if (!sessionId) return null;
  try {
    const raw = await redisClient.get(key(sessionId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function touchSession(sessionId, ttlSeconds = DEFAULT_TTL) {
  if (!sessionId) return;
  try {
    await redisClient.expire(key(sessionId), ttlSeconds);
  } catch { /* non-critical */ }
}

export async function destroySession(sessionId) {
  if (!sessionId) return;
  try {
    await redisClient.del(key(sessionId));
  } catch { /* non-critical */ }
}
