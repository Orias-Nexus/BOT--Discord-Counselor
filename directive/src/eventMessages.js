/**
 * Send event message (Greeting, Leaving, Boosting, Leveling, Logging) to configured channel.
 * Only when channel_id and embed_id are set (user-defined embed).
 */
import * as api from './api.js';
import { messageSender } from './utils/messageSender.js';

const CACHE_TTL_MS = 60 * 1000;
const messageConfigCache = new Map();
const embedCache = new Map();

function nowMs() {
  return Date.now();
}

function getCached(map, key) {
  const item = map.get(key);
  if (!item) return null;
  if (item.expiresAt <= nowMs()) {
    map.delete(key);
    return null;
  }
  return item.value;
}

function setCached(map, key, value, ttlMs = CACHE_TTL_MS) {
  map.set(key, { value, expiresAt: nowMs() + ttlMs });
}

async function getMessageConfig(guildId, messagesType) {
  const key = `${guildId}:${messagesType}`;
  const cached = getCached(messageConfigCache, key);
  if (cached) return cached;
  const config = await api.getMessageByType(guildId, messagesType).catch(() => null);
  if (config) setCached(messageConfigCache, key, config);
  return config;
}

async function getEmbedData(guildId, embedId) {
  const key = `${guildId}:${embedId}`;
  const cached = getCached(embedCache, key);
  if (cached) return cached;
  const row = await api.getEmbed(guildId, embedId).catch(() => null);
  const embed = row?.embed ?? null;
  if (embed) setCached(embedCache, key, embed);
  return embed;
}

/**
 * Send embed to channel per Messages config (channel_id, embed_id). Requires embed_id in config (no default embed).
 * @param {import('discord.js').Guild} guild
 * @param {'Greeting'|'Leaving'|'Boosting'|'Leveling'|'Logging'} messagesType
 * @param {{ member?, guild?, channel? }} meta - member may be partial (Leaving)
 * @returns {Promise<boolean>} true if sent, false if skipped (no config / error)
 */
export async function sendEventMessage(guild, messagesType, meta = {}) {
  if (!guild?.id) return false;
  const config = await getMessageConfig(guild.id, messagesType);
  if (!config) return false;
  const channelId = config.channel_id ?? null;
  if (!channelId || channelId === '0') return false;

  const embedData = config.embed_id ? await getEmbedData(guild.id, config.embed_id) : null;
  if (!embedData) return false;

  try {
    const res = await messageSender(guild, channelId, embedData, meta);
    return res.ok;
  } catch (err) {
    return false;
  }
}
