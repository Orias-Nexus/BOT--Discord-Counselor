/**
 * Worker consume queue `discord-actions` do Backend (Web) dispatch.
 * Thin dispatcher — delegates to script execute() functions (single source of truth).
 * Mỗi job trả về { ok, resultMeta, serverId } để BE emit socket tới client.
 */
import { Worker } from 'bullmq';
import { ChannelType, PermissionFlagsBits } from '../discord.js';
import { redisClient } from '../utils/redis.js';
import * as api from '../api.js';

import { execute as warnExecute } from '../scripts/memberWarn.js';
import { execute as muteExecute } from '../scripts/memberMute.js';
import { execute as lockExecute } from '../scripts/memberLock.js';
import { execute as kickExecute } from '../scripts/memberKick.js';
import { execute as resetExecute } from '../scripts/memberReset.js';
import { execute as moveExecute } from '../scripts/memberMove.js';
import { execute as voiceCreatorExecute } from '../scripts/setVoiceCreator.js';
import { execute as messageSendExecute } from '../scripts/messageSend.js';
import { executeTest as messageTestExecute } from '../utils/messageTest.js';

const QUEUE_NAME = 'discord-actions';

async function fetchMember(guild, userId) {
  if (!userId) return null;
  return guild.members.cache.get(userId) ?? guild.members.fetch(userId).catch(() => null);
}

async function getGuild(client, serverId) {
  return client.guilds.cache.get(serverId) ?? client.guilds.fetch(serverId).catch(() => null);
}

async function resolveExecutor(client, actorId) {
  if (!actorId) return null;
  return client.users.cache.get(actorId) ?? client.users.fetch(actorId).catch(() => null);
}

async function prepareMemberContext(client, job) {
  const { serverId, targetId, actorId } = job.data;
  const guild = await getGuild(client, serverId);
  if (!guild) throw new Error('Guild not found');
  const member = await fetchMember(guild, targetId);
  if (!member) throw new Error('Target member not found');
  await api.ensureServer(guild.id);
  const server = await api.getServer(guild.id);
  const executorUser = await resolveExecutor(client, actorId);
  return { guild, member, server, executorUser };
}

function assertOk(result) {
  if (!result.ok) throw new Error(result.error || 'Action failed');
  return result;
}

// --- Channel handlers that don't have a script equivalent yet ---

async function handleChannelCreateStats(job, client) {
  const { serverId, meta = {} } = job.data;
  const guild = await getGuild(client, serverId);
  if (!guild) throw new Error('Guild not found');

  const category = await guild.channels.create({
    name: 'server stats',
    type: ChannelType.GuildCategory,
    reason: 'Created via dashboard (Stats)',
    permissionOverwrites: [{
      id: guild.id,
      allow: [PermissionFlagsBits.ViewChannel],
      deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
    }],
  });

  const channelsIdx = Number(meta.channelsIdx ?? 0);
  await api.upsertChannel(serverId, category.id, 'Stats', channelsIdx);
  return { ok: true, resultMeta: { categoryId: category.id, categoryType: 'Stats' } };
}

async function handleChannelDelete(job, client) {
  const { serverId, meta = {} } = job.data;
  const guild = await getGuild(client, serverId);
  if (!guild) throw new Error('Guild not found');

  const { categoryId } = meta;
  if (!categoryId) throw new Error('delete: missing categoryId');

  const category = await guild.channels.fetch(categoryId).catch(() => null);
  if (category) {
    const children = [...guild.channels.cache.filter((c) => c.parentId === categoryId).values()];
    for (const ch of children) await ch.delete('Dashboard delete').catch(() => null);
    await category.delete('Dashboard delete').catch(() => null);
  }
  return { ok: true, resultMeta: { categoryId } };
}

// --- Simple member actions without dedicated scripts ---

async function handleTimeout(job, client) {
  const { serverId, targetId, meta = {} } = job.data;
  const guild = await getGuild(client, serverId);
  if (!guild) throw new Error('Guild not found');
  const member = await fetchMember(guild, targetId);
  if (!member) throw new Error('Target member not found');

  const duration = Number(meta.durationMs || 0);
  if (duration > 0) {
    await member.timeout(Math.min(duration, 28 * 24 * 3600 * 1000));
  } else {
    await member.timeout(null).catch(() => null);
  }
  return { ok: true, resultMeta: { durationMs: duration } };
}

async function handleRoleApply(job, client) {
  const { serverId, targetId, meta = {} } = job.data;
  const guild = await getGuild(client, serverId);
  if (!guild) throw new Error('Guild not found');
  const member = await fetchMember(guild, targetId);
  if (!member) throw new Error('Target member not found');
  if (!meta.roleId) throw new Error('role_apply: missing roleId');
  await member.roles.add(meta.roleId);
  return { ok: true, resultMeta: { roleId: meta.roleId } };
}

async function handleRoleRemove(job, client) {
  const { serverId, targetId, meta = {} } = job.data;
  const guild = await getGuild(client, serverId);
  if (!guild) throw new Error('Guild not found');
  const member = await fetchMember(guild, targetId);
  if (!member) throw new Error('Target member not found');
  if (!meta.roleId) throw new Error('role_remove: missing roleId');
  await member.roles.remove(meta.roleId);
  return { ok: true, resultMeta: { roleId: meta.roleId } };
}

export function initDiscordActionsWorker(client) {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      console.log(`[discord-actions] ${job.name} (jobId=${job.id})`);
      const serverId = job.data?.serverId;
      let result;

      switch (job.name) {
        // --- Member actions → delegate to script execute() ---
        case 'member.warn': {
          const ctx = await prepareMemberContext(client, job);
          result = assertOk(await warnExecute(ctx));
          break;
        }
        case 'member.mute': {
          const ctx = await prepareMemberContext(client, job);
          result = assertOk(await muteExecute(ctx));
          break;
        }
        case 'member.lock': {
          const ctx = await prepareMemberContext(client, job);
          result = assertOk(await lockExecute(ctx));
          break;
        }
        case 'member.kick': {
          const { serverId: sid, targetId, actorId } = job.data;
          const guild = await getGuild(client, sid);
          if (!guild) throw new Error('Guild not found');
          const member = await fetchMember(guild, targetId);
          if (!member) throw new Error('Target member not found');
          const executorUser = await resolveExecutor(client, actorId);
          result = assertOk(await kickExecute({ guild, member, executorUser }));
          break;
        }
        case 'member.reset': {
          const ctx = await prepareMemberContext(client, job);
          result = assertOk(await resetExecute(ctx));
          break;
        }
        case 'member.move': {
          const { serverId: sid, targetId, meta = {} } = job.data;
          const guild = await getGuild(client, sid);
          if (!guild) throw new Error('Guild not found');
          if (!meta.channelId) throw new Error('move: missing channelId');
          let members = [];
          if (targetId) {
            const m = await fetchMember(guild, targetId);
            if (m) members = [m];
          } else {
            members = Array.from(guild.members.cache.filter((m) => !m.user.bot && m.voice?.channelId).values());
          }
          result = assertOk(await moveExecute({ guild, members, channelId: meta.channelId }));
          break;
        }

        // --- Simple member actions (no dedicated script) ---
        case 'member.timeout':    result = await handleTimeout(job, client); break;
        case 'member.role_apply': result = await handleRoleApply(job, client); break;
        case 'member.role_remove': result = await handleRoleRemove(job, client); break;

        // --- Channel actions ---
        case 'channel.create_stats':         result = await handleChannelCreateStats(job, client); break;
        case 'channel.create_voice_creator': {
          const guild = await getGuild(client, serverId);
          if (!guild) throw new Error('Guild not found');
          result = assertOk(await voiceCreatorExecute({ guild }));
          break;
        }
        case 'channel.delete': result = await handleChannelDelete(job, client); break;

        // --- Message actions → delegate to script execute() ---
        case 'message.test': {
          const { meta = {}, actorId } = job.data;
          if (!meta.messagesType) throw new Error('message.test: missing messagesType');
          const guild = await getGuild(client, serverId);
          if (!guild) throw new Error('Guild not found');
          const member = actorId ? await fetchMember(guild, actorId) : null;
          result = assertOk(await messageTestExecute({ guild, messagesType: meta.messagesType, member }));
          break;
        }
        case 'message.send':
        case 'embed.send': {
          const { meta = {}, actorId } = job.data;
          if (!meta.channelId) throw new Error('message.send: missing channelId');
          const guild = await getGuild(client, serverId);
          if (!guild) throw new Error('Guild not found');
          const member = actorId ? await fetchMember(guild, actorId) : null;
          result = assertOk(await messageSendExecute({
            guild,
            channelId: meta.channelId,
            embedId: meta.embedId ?? null,
            content: meta.content ?? null,
            member,
          }));
          break;
        }

        default:
          throw new Error(`Unknown job: ${job.name}`);
      }

      return { ...result, serverId };
    },
    { connection: redisClient, concurrency: 4 },
  );

  worker.on('completed', (job) => console.log(`[discord-actions] done ${job.name} (${job.id})`));
  worker.on('failed', (job, err) => console.error(`[discord-actions] FAIL ${job?.name} (${job?.id}):`, err.message));
  worker.on('error', (err) => console.error('[discord-actions] worker error:', err.message));

  return worker;
}
