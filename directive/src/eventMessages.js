/**
 * Send event message (Greeting, Leaving, Boosting, Leveling, Logging) to configured channel.
 * Only when channel_id and embed_id are set (user-defined embed).
 */
import * as api from './api.js';
import { messageSender } from './utils/messageSender.js';

const CACHE_TTL_MS = 30 * 1000;
const messageConfigCache = new Map();
const embedCache = new Map();

function nowMs() {
  return Date.now();
}

function getCached(map, key) {
  const item = map.get(key);
  if (!item) return undefined;
  if (item.expiresAt <= nowMs()) {
    map.delete(key);
    return undefined;
  }
  return item.value;
}

function setCached(map, key, value, ttlMs = CACHE_TTL_MS) {
  map.set(key, { value, expiresAt: nowMs() + ttlMs });
}

/** Clear all caches — call when config changes detected */
export function invalidateEventMessageCache(guildId = null) {
  if (guildId) {
    for (const key of messageConfigCache.keys()) {
      if (key.startsWith(`${guildId}:`)) messageConfigCache.delete(key);
    }
    for (const key of embedCache.keys()) {
      if (key.startsWith(`${guildId}:`)) embedCache.delete(key);
    }
  } else {
    messageConfigCache.clear();
    embedCache.clear();
  }
}

async function getMessageConfig(guildId, messagesType) {
  const key = `${guildId}:${messagesType}`;
  const cached = getCached(messageConfigCache, key);
  if (cached !== undefined) return cached;
  try {
    const config = await api.getMessageByType(guildId, messagesType);
    setCached(messageConfigCache, key, config ?? null);
    return config ?? null;
  } catch (err) {
    console.warn(`[eventMessages] getMessageConfig ${messagesType} failed:`, err?.message ?? err);
    return null;
  }
}

async function getEmbedData(guildId, embedId) {
  const key = `${guildId}:${embedId}`;
  const cached = getCached(embedCache, key);
  if (cached !== undefined) return cached;
  try {
    const row = await api.getEmbed(guildId, embedId);
    const embed = row?.embed ?? null;
    setCached(embedCache, key, embed);
    return embed;
  } catch (err) {
    console.warn(`[eventMessages] getEmbedData ${embedId} failed:`, err?.message ?? err);
    return null;
  }
}

/**
 * Send embed to channel per Messages config (channel_id, embed_id). Requires embed_id in config (no default embed).
 * @param {import('discord.js').Guild} guild
 * @param {'Greeting'|'Leaving'|'Boosting'|'Leveling'|'Logging'} messagesType
 * @param {{ member?, guild?, channel? }} meta - member may be partial (Leaving)
 * @returns {Promise<boolean>} true if sent, false if skipped (no config / error)
 */
export async function sendEventMessage(guild, messagesType, meta = {}) {
  const tag = `[eventMessages:${messagesType}]`;
  if (!guild?.id) return false;

  const config = await getMessageConfig(guild.id, messagesType);
  if (!config) {
    console.debug(`${tag} No config found for guild ${guild.id}`);
    return false;
  }

  const channelId = config.channel_id ?? null;
  if (!channelId || channelId === '0') {
    console.debug(`${tag} No channel configured (channel_id=${channelId})`);
    return false;
  }

  if (!config.embed_id) {
    console.debug(`${tag} No embed configured, skipping`);
    return false;
  }

  const embedData = await getEmbedData(guild.id, config.embed_id);
  if (!embedData) {
    console.warn(`${tag} Embed ${config.embed_id} not found or empty — skipping send`);
    return false;
  }

  try {
    const res = await messageSender(guild, channelId, embedData, meta);
    if (!res.ok) {
      console.warn(`${tag} messageSender failed: ${res.reason}`);
    }
    return res.ok;
  } catch (err) {
    console.error(`${tag} messageSender threw:`, err?.message ?? err);
    return false;
  }
}
