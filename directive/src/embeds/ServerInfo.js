import { ChannelType } from 'discord.js';
import { EMBED_COLORS } from './schema.js';
import { formatShortDate, getGuildTypeString } from './utils.js';

/**
 * Trả về embed data Server Info (plain object). channel.send({ embeds: [data] }) hoặc editReply({ embeds: [data] }).
 * @param {import('discord.js').Guild} guild
 * @param {{ imageURL?: string }} options
 * @returns {object}
 */
export function getServerInfoEmbed(guild, options = {}) {
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
  const memberCount = guild.memberCount ?? guild.members.cache.size;
  const rolesCount = guild.roles.cache.size;
  const boostCount = guild.premiumSubscriptionCount ?? 0;
  const stickerCount = guild.stickers.cache.size;
  const emojiCount = guild.emojis.cache.size;
  const soundCount = guild.soundboardSounds?.cache?.size ?? 0;
  const description = guild.description ? guild.description.slice(0, 2048) : null;

  const embed = {
    title: `✦ ${guild.name}`,
    color: EMBED_COLORS.SERVER_INFO,
    thumbnail: guild.iconURL({ size: 256 }) ? { url: guild.iconURL({ size: 256 }) } : undefined,
    fields: [
      { name: 'ID', value: guild.id, inline: true },
      { name: 'Name', value: guild.name, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Created At', value: formatShortDate(guild.createdAt), inline: true },
      { name: 'Type', value: getGuildTypeString(guild), inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Channel', value: `Chat: ${chatCount} | Voice: ${voiceCount}`, inline: true },
      { name: 'Category', value: String(categoryCount), inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Member', value: String(memberCount), inline: true },
      { name: 'Role', value: String(rolesCount), inline: true },
      { name: 'Boost', value: String(boostCount), inline: true },
      { name: 'Sticker', value: String(stickerCount), inline: true },
      { name: 'Emoji', value: String(emojiCount), inline: true },
      { name: 'Sound', value: String(soundCount), inline: true },
    ],
  };
  if (description) embed.footer = { text: description };
  if (options.imageURL) embed.image = { url: options.imageURL };
  return embed;
}
