import { redisClient } from '../utils/redis.js';

const BASE_EXP = 40;
const COOLDOWN_SECONDS = 300;

/**
 * Lua script: atomic cooldown check + daily count increment.
 * KEYS[1] = cooldown key, KEYS[2] = daily count key
 * ARGV[1] = cooldown TTL (seconds), ARGV[2] = midnight UTC timestamp
 * Returns [passed (0|1), dailyCount]
 */
const LUA_COOLDOWN_AND_COUNT = `
local cdOk = redis.call('SET', KEYS[1], '1', 'NX', 'EX', tonumber(ARGV[1]))
if not cdOk then
  return {0, 0}
end
local count = redis.call('INCR', KEYS[2])
if count == 1 then
  redis.call('EXPIREAT', KEYS[2], tonumber(ARGV[2]))
end
return {1, count}
`;

function getNextMidnightUTC() {
  const now = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
  return Math.floor(midnight.getTime() / 1000);
}

function getMultiplier(dailyCount) {
  if (dailyCount <= 1) return 2.0;
  if (dailyCount <= 11) return 1.0;
  if (dailyCount <= 31) return 0.5;
  return 0.2;
}

function computeExp(dailyCount) {
  return Math.floor(BASE_EXP * getMultiplier(dailyCount));
}

/**
 * Try to award EXP for a single flow (local or global).
 * @param {'local'|'global'} type
 * @param {string} guildId - only used for local
 * @param {string} userId
 * @returns {Promise<{ passed: boolean, dailyCount: number, exp: number }>}
 */
export async function tryAwardExp(type, guildId, userId) {
  const cdKey = type === 'local'
    ? `xp:cd:local:${guildId}:${userId}`
    : `xp:cd:global:${userId}`;
  const dcKey = type === 'local'
    ? `xp:dc:local:${guildId}:${userId}`
    : `xp:dc:global:${userId}`;

  const midnight = getNextMidnightUTC();

  const result = await redisClient.eval(
    LUA_COOLDOWN_AND_COUNT,
    2,
    cdKey, dcKey,
    COOLDOWN_SECONDS, midnight,
  );

  const passed = Number(result[0]) === 1;
  const dailyCount = Number(result[1]);

  return {
    passed,
    dailyCount,
    exp: passed ? computeExp(dailyCount) : 0,
  };
}

export { BASE_EXP, COOLDOWN_SECONDS, getMultiplier, computeExp };
