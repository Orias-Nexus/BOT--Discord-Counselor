import { EmbedBuilder } from '../discord.js';
import * as api from '../api.js';

// Cache for channel_id mapping (1 minute TTL)
const cache = new Map();
const CACHE_TTL_MS = 60000;

export async function getLoggingChannelId(guildId) {
  const now = Date.now();
  const cached = cache.get(guildId);
  if (cached && cached.expires > now) {
    return cached.channelId;
  }

  const config = await api.getMessageByType(guildId, 'Logging').catch(() => null);
  const channelId = config?.channel_id || null;

  cache.set(guildId, { channelId, expires: now + CACHE_TTL_MS });

  if (cache.size > 100) {
    for (const [k, v] of cache.entries()) {
      if (v.expires <= now) cache.delete(k);
    }
  }
  return channelId;
}

/**
 * Sends a hard-coded Audit Log Embed to the configured Logging channel.
 * @param {import('discord.js').Guild} guild 
 * @param {Object} options 
 * @param {string} options.action - Short title of action
 * @param {import('discord.js').User} [options.executor] - Who executed
 * @param {import('discord.js').User|string} [options.target] - Target user, channel name, etc.
 * @param {string} [options.reason] - Optional reason
 * @param {Array<{name: string, value: string}>} [options.fields] - Extra fields for the embed
 * @param {number|string} [options.color] - Embed hex color (#e74c3c, #f1c40f, #3498db, etc)
 */
export async function sendAuditLog(guild, options) {
  if (!guild?.id) return false;

  const channelId = await getLoggingChannelId(guild.id);
  // Log message is skipped if channel_id is 0 or null
  if (!channelId || channelId === '0') return false;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return false;

  const { action, executor, target, reason, fields = [], color = '#3498db' } = options;

  const embed = new EmbedBuilder()
    .setTitle(`📝 Log: ${action || 'Action'}`)
    .setColor(color)
    .setTimestamp();

  if (executor) {
    embed.setAuthor({
      name: executor.username,
      iconURL: executor.displayAvatarURL()
    });
    embed.addFields({ name: 'Executor', value: `${executor} (\`${executor.id}\`)`, inline: true });
  }

  if (target) {
    if (typeof target === 'string') {
      embed.addFields({ name: 'Target', value: target, inline: true });
    } else {
      embed.addFields({ name: 'Target', value: `${target} (\`${target.id}\`)`, inline: true });
    }
  }

  if (reason) {
    embed.addFields({ name: 'Reason', value: reason, inline: false });
  }

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  try {
    await channel.send({ embeds: [embed] });
    return true;
  } catch (err) {
    console.error(`[AuditLogger] Failed to send log to ${channelId} in ${guild.id}:`, err?.message);
    return false;
  }
}
