/**
 * Queue cho các action Discord dispatch từ Web → Directive.
 * Tên job là CONTRACT giữa BE và DIR, không được đổi mà không migrate 2 phía.
 */
import { Queue, QueueEvents } from 'bullmq';
import { redisClient } from './redis.js';
import { emitEvent } from './socket.js';

export const DISCORD_ACTION_JOBS = Object.freeze({
  MEMBER_KICK: 'member.kick',
  MEMBER_MUTE: 'member.mute',
  MEMBER_WARN: 'member.warn',
  MEMBER_LOCK: 'member.lock',
  MEMBER_MOVE: 'member.move',
  MEMBER_RESET: 'member.reset',
  MEMBER_ROLE_APPLY: 'member.role_apply',
  MEMBER_ROLE_REMOVE: 'member.role_remove',
  MEMBER_TIMEOUT: 'member.timeout',
  CHANNEL_CREATE_STATS: 'channel.create_stats',
  CHANNEL_CREATE_VOICE_CREATOR: 'channel.create_voice_creator',
  CHANNEL_DELETE: 'channel.delete',
  MESSAGE_SEND: 'message.send',
  MESSAGE_TEST: 'message.test',
  EMBED_SEND: 'embed.send',
});

export const discordActionsQueue = new Queue('discord-actions', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 1000, age: 24 * 3600 },
    removeOnFail: { count: 1000, age: 7 * 24 * 3600 },
  },
});

const queueEvents = new QueueEvents('discord-actions', { connection: redisClient });

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  // Worker trả về dạng `{ ok, resultMeta, serverId }`.
  try {
    const parsed = typeof returnvalue === 'string' ? JSON.parse(returnvalue) : returnvalue;
    if (parsed?.serverId) {
      emitEvent('job:update', { jobId, status: 'completed', resultMeta: parsed.resultMeta ?? null }, parsed.serverId);
    } else {
      emitEvent('job:update', { jobId, status: 'completed', resultMeta: parsed?.resultMeta ?? null });
    }
  } catch { /* non-critical */ }
});

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  try {
    const job = await discordActionsQueue.getJob(jobId);
    const serverId = job?.data?.serverId ?? null;
    emitEvent('job:update', { jobId, status: 'failed', error: failedReason }, serverId);
  } catch {
    emitEvent('job:update', { jobId, status: 'failed', error: failedReason });
  }
});

queueEvents.on('error', (err) => {
  console.error('[queue] events error:', err.message);
});

/**
 * Dispatch job. Payload bắt buộc có `serverId` để room socket hoạt động.
 */
export async function dispatchAction(jobName, payload) {
  if (!payload?.serverId) throw new Error('dispatchAction: payload.serverId is required');
  const job = await discordActionsQueue.add(jobName, payload);
  return { jobId: job.id, status: 'queued' };
}
