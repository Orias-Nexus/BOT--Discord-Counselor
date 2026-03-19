/**
 * Send event message (Greeting, Leaving, Boosting) to configured channel.
 * Only when channel_id and embed_id are set (user-defined embed).
 */
import * as api from './api.js';
import { messageSender } from './utils/messageSender.js';

/**
 * Send embed to channel per Messages config (channel_id, embed_id). Requires embed_id in config (no default embed).
 * @param {import('discord.js').Guild} guild
 * @param {'Greeting'|'Leaving'|'Boosting'} messagesType
 * @param {{ member?, guild?, channel? }} meta - member may be partial (Leaving)
 * @returns {Promise<boolean>} true if sent, false if skipped (no config / error)
 */
export async function sendEventMessage(guild, messagesType, meta = {}) {
  if (!guild?.id) return false;
  let config;
  try {
    config = await api.getMessageByType(guild.id, messagesType);
  } catch (err) {
    return false;
  }
  if (!config) return false;
  const channelId = config.channel_id ?? null;
  if (!channelId || channelId === '0') return false;

  let embedData;
  if (config.embed_id) {
    const row = await api.getEmbed(guild.id, config.embed_id).catch(() => null);
    if (row?.embed) {
      embedData = row.embed;
    }
  }
  if (!embedData) return false;

  try {
    const res = await messageSender(guild, channelId, embedData, meta);
    return res.ok;
  } catch (err) {
    return false;
  }
}
