import Redis from 'ioredis';
import { Queue } from 'bullmq';
import env from '../config/env.js';

function buildRedisOptions(url) {
  const opts = { maxRetriesPerRequest: null };
  if (url.startsWith('rediss://')) {
    opts.tls = { rejectUnauthorized: false };
  }
  return opts;
}

export const redisClient = new Redis(env.redisStorageUrl, buildRedisOptions(env.redisStorageUrl));

redisClient.on('connect', () => {
  console.log(`[Redis] Connected (${env.isProd ? 'production' : 'local'})`);
});

redisClient.on('error', (err) => {
  console.error('[Redis] Error:', err.message);
});

export const discordQueue = new Queue('BotTasks', { connection: redisClient });

export const publishBotTask = async (taskName, data) => {
  try {
    await discordQueue.add(taskName, data, {
      removeOnComplete: true,
      removeOnFail: false,
    });
    console.log(`[Queue] Pushed task: ${taskName}`);
  } catch (error) {
    console.error('[Queue] Push error:', error);
  }
};
