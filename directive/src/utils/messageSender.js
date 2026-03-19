import { EmbedBuilder } from 'discord.js';
import { resolveEmbed } from '../embeds/.embedContext.js';

const MAX_EMBED_DESCRIPTION = 4096;

function truncate(str, maxLen) {
  const s = String(str ?? '');
  if (s.length <= maxLen) return s;
  return s.slice(0, Math.max(0, maxLen - 1)) + '…';
}

function toTextEmbed(description) {
  const desc = truncate(description, MAX_EMBED_DESCRIPTION);
  return { description: desc };
}

function parseEmbedJson(embedJson) {
  if (embedJson == null || embedJson === '') return null;

  if (typeof embedJson === 'string') {
    const trimmed = embedJson.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      return toTextEmbed(trimmed);
    }
  }

  if (typeof embedJson === 'object') return embedJson;
  return toTextEmbed(String(embedJson));
}

function normalizeEmbedObject(input) {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] ?? null;
  if (Array.isArray(input.embeds)) return input.embeds[0] ?? null;
  return input;
}

/**
 * Send an embed to a channel by id.
 * @param {import('discord.js').Guild} guild
 * @param {string} channelId
 * @param {string|object} embedJson - Plain embed object or JSON string.
 * @param {{ member?: import('discord.js').GuildMember|null, placeholderCache?: Record<string, string> }} meta
 * @returns {Promise<{ ok: true, messageId: string } | { ok: false, reason: string }>}
 */
export async function messageSender(guild, channelId, embedJson, meta = {}) {
  if (!guild?.id) return { ok: false, reason: 'Missing guild.' };
  if (!channelId) return { ok: false, reason: 'Missing channel.' };

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel) return { ok: false, reason: 'Channel not found.' };
  if (!channel.isTextBased?.() || !('send' in channel)) return { ok: false, reason: 'Channel is not text-based.' };

  const parsed = parseEmbedJson(embedJson);
  const embedObject = normalizeEmbedObject(parsed);
  if (!embedObject || typeof embedObject !== 'object') return { ok: false, reason: 'Embed is empty.' };

  const resolved = await resolveEmbed(embedObject, { ...meta, guild, channel });
  const embed = EmbedBuilder.from(resolved);

  const sent = await channel.send({ embeds: [embed] }).catch((err) => {
    throw new Error(err?.message || 'Send failed.');
  });

  return { ok: true, messageId: sent.id };
}

