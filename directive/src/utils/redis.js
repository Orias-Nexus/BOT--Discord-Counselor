import Redis from 'ioredis';
import { REDIS_URL } from '../config.js';

function buildRedisOptions(url) {
  const opts = { maxRetriesPerRequest: null };
  if (url.startsWith('rediss://')) {
    opts.tls = { rejectUnauthorized: false };
  }
  return opts;
}

export const redisClient = new Redis(REDIS_URL, buildRedisOptions(REDIS_URL));

redisClient.on('error', (err) => {
  console.error('[Redis]', err.message);
});
