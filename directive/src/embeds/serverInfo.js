import { ChannelType } from '../discord.js';
import { EMBED_COLORS } from './schema.js';
import { formatShortDate, getGuildTypeString } from './utils.js';
import { resolveEmbed } from './.embedContext.js';

/**
 * Trả về embed data Server Info (đã resolve placeholders qua parser).
 * @param {import('discord.js').Guild} guild
 * @param {{ imageURL?: string }} options
 * @returns {Promise<object>}
 */
export async function getServerInfoEmbed(guild, options = {}) {
  const chatCount = guild.channels.cache.filter(
    (c) =>
      c.type === ChannelType.GuildText ||
      c.type === ChannelType.GuildAnnouncement ||
      c.type === ChannelType.GuildForum
  ).size;
  const voiceCount = guild.channels.cache.filter(
    (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice
  ).size;
  const categoryCount = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
  const stickerCount = guild.stickers.cache.size;
  const emojiCount = guild.emojis.cache.size;
  const soundCount = guild.soundboardSounds?.cache?.size ?? 0;
  const description = guild.description ? guild.description.slice(0, 2048) : null;

  const embed = {
    title: '✦ {server_name}',
    color: EMBED_COLORS.SERVER_INFO,
    thumbnail: guild.iconURL({ size: 256 }) ? { url: '{server_icon}' } : undefined,
    fields: [
      { name: 'ID', value: '{server_id}', inline: true },
      { name: 'Name', value: '{server_name}', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Created At', value: formatShortDate(guild.createdAt), inline: true },
      { name: 'Type', value: getGuildTypeString(guild), inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Channel', value: `Chat: ${chatCount} | Voice: ${voiceCount}`, inline: true },
      { name: 'Category', value: String(categoryCount), inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Member', value: '{server_membercount}', inline: true },
      { name: 'Role', value: '{server_rolecount}', inline: true },
      { name: 'Boost', value: '{server_boostcount}', inline: true },
      { name: 'Sticker', value: String(stickerCount), inline: true },
      { name: 'Emoji', value: String(emojiCount), inline: true },
      { name: 'Sound', value: String(soundCount), inline: true },
    ],
  };
  if (description) embed.footer = { text: description };
  if (options.imageURL) embed.image = { url: options.imageURL };

  return resolveEmbed(embed, { guild });
}
