import { redisClient } from './redis.js';

const PREFIX = 'cache:';

/**
 * Get cached JSON value by key. Returns null on miss or Redis error.
 */
export async function cacheGet(key) {
  try {
    const raw = await redisClient.get(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Set JSON value in cache with TTL (seconds).
 * Silently ignores errors so cache failures never break the app.
 */
export async function cacheSet(key, value, ttlSeconds = 120) {
  try {
    await redisClient.set(PREFIX + key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch { /* non-critical */ }
}

/**
 * Delete one or more cache keys (supports glob pattern with `*`).
 */
export async function cacheDel(...keys) {
  try {
    const fullKeys = keys.map((k) => PREFIX + k);
    if (fullKeys.length > 0) await redisClient.del(...fullKeys);
  } catch { /* non-critical */ }
}

/**
 * Delete all keys matching a pattern (e.g. `embeds:list:*`).
 * Uses SCAN to avoid blocking Redis.
 */
export async function cacheDelPattern(pattern) {
  try {
    const fullPattern = PREFIX + pattern;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) await redisClient.del(...keys);
    } while (cursor !== '0');
  } catch { /* non-critical */ }
}
