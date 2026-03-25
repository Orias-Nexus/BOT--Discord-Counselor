import { ChannelType } from '../discord.js';
import * as api from '../api.js';
import { buildChannelInfoPayload } from './channelInfo.js';

const MAX_CHANNEL_NAME_LENGTH = 100;
const SAFE_NAME_REGEX = /[^\w\s-]/g;
const voiceRoomControlOwners = new Map();

export function getVoiceRoomControlOwner(messageId) {
  if (!messageId) return null;
  return voiceRoomControlOwners.get(messageId) ?? null;
}

function sanitizeChannelName(name) {
  if (typeof name !== 'string') return 'voice';
  const sanitized = name.replace(SAFE_NAME_REGEX, '').replace(/\s+/g, ' ').trim();
  return sanitized.slice(0, MAX_CHANNEL_NAME_LENGTH) || 'voice';
}

function getFirstVoiceChannelInCategory(guild, categoryId) {
  const children = guild.channels.cache.filter(
    (c) => c.parentId === categoryId && (c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice)
  );
  const sorted = [...children.values()].sort((a, b) => (a.rawPosition ?? a.position) - (b.rawPosition ?? b.position));
  return sorted[0] ?? null;
}

/**
 * Script được gọi từ Event VoiceStateUpdate.
 * - Join kênh Creator (kênh trigger = kênh thoại đầu tiên trong danh mục Creator): clone, đặt tên theo người tạo, move member vào clone.
 * - Leave kênh clone (rỗng): xoá kênh clone.
 */
export async function run(_interaction, client, eventContext) {
  const { oldState, newState } = eventContext ?? {};
  if (!oldState || !newState) return;

  const guild = newState.guild ?? oldState.guild;
  if (!guild) return;

  let creatorRows = [];
  try {
    creatorRows = await api.getChannels(guild.id, 'Creator');
  } catch (err) {
    console.warn('[ChannelCreate] getChannels:', err?.message ?? err);
    return;
  }

  const creatorCategoryIds = new Set((creatorRows ?? []).map((r) => r.category_id).filter(Boolean));
  const creatorTriggerChannelIds = new Set(
    (creatorRows ?? []).map((r) => getFirstVoiceChannelInCategory(guild, r.category_id)).filter(Boolean).map((c) => c.id)
  );

  if (newState.channelId && creatorTriggerChannelIds.has(newState.channelId)) {
    await handleJoinCreator(newState, creatorTriggerChannelIds);
    return;
  }

  if (oldState.channelId) {
    await handleLeaveChannel(guild, oldState, creatorTriggerChannelIds, creatorCategoryIds);
  }
}

async function handleJoinCreator(newState, creatorTriggerChannelIds) {
  const sourceChannel = newState.channel;
  const member = newState.member;
  if (!sourceChannel || !member || sourceChannel.type !== ChannelType.GuildVoice) return;
  if (member.user.bot) return;

  try {
    const clone = await sourceChannel.clone({
      name: sanitizeChannelName(member.displayName ?? member.user.username),
      parent: sourceChannel.parentId,
      reason: 'ChannelCreate: clone for member',
    });

    await clone.permissionOverwrites.edit(member.id, {
      ViewChannel: true,
      Connect: true,
      Speak: true,
      Stream: true,
      UseVAD: true,
      MoveMembers: true,
      ManageChannels: true,
    }).catch((err) => {
      console.warn('[ChannelCreate] owner permissions:', err?.message);
    });

    await member.voice.setChannel(clone).catch((err) => {
      console.warn('[ChannelCreate] setChannel:', err?.message);
    });

    if (clone.isTextBased()) {
      const infoPayload = await buildChannelInfoPayload(clone, clone.guild);
      if (infoPayload) {
        const controlMessage = await clone.send({
          content: api.formatEphemeralContent(
            `Welcome ${member}. This room is yours. Use the controls below to manage room status quickly.`
          ),
          ...infoPayload,
        }).catch((err) => {
          console.warn('[ChannelCreate] send ChannelInfo:', err?.message);
          return null;
        });

        if (controlMessage?.id) {
          voiceRoomControlOwners.set(controlMessage.id, member.id);
          // Keep map bounded to avoid unlimited growth in long-running process.
          if (voiceRoomControlOwners.size > 2000) {
            const oldestKey = voiceRoomControlOwners.keys().next().value;
            if (oldestKey) voiceRoomControlOwners.delete(oldestKey);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[ChannelCreate] clone/setChannel:', err?.message ?? err);
  }
}

async function handleLeaveChannel(guild, oldState, creatorTriggerChannelIds, creatorCategoryIds) {
  if (creatorTriggerChannelIds.has(oldState.channelId)) return;

  const channel = oldState.channel ?? (await guild.channels.fetch(oldState.channelId).catch(() => null));
  if (!channel || channel.type !== ChannelType.GuildVoice) return;

  const parentId = channel.parentId ?? channel.parent;
  if (!parentId || !creatorCategoryIds.has(parentId)) return;

  try {
    const fetched = await guild.channels.fetch(channel.id).catch(() => null);
    const memberCount = fetched?.members?.size ?? channel.members?.size ?? 0;
    if (memberCount > 0) return;
    await channel.delete('ChannelCreate: empty clone channel').catch((err) => {
      console.warn('[ChannelCreate] delete:', err?.message);
    });
  } catch (err) {
    console.warn('[ChannelCreate] leave cleanup:', err?.message ?? err);
  }
}
