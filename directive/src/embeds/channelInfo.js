import { ChannelType } from 'discord.js';
import { EMBED_COLORS } from './schema.js';
import { formatShortDate, getChannelTypeName, getChannelStatus } from './utils.js';
import { resolveEmbed } from './.embedContext.js';

/**
 * Trả về embed data Channel Info (đã resolve placeholders qua parser).
 * @param {import('discord.js').Channel} channel
 * @param {import('discord.js').Guild} guild
 * @param {{ imageURL?: string }} options
 * @returns {Promise<object>}
 */
export async function getChannelInfoEmbed(channel, guild, options = {}) {
  const created = channel.createdAt ? formatShortDate(channel.createdAt) : 'N/A';
  const categoryName = channel.parent ? channel.parent.name : 'None';
  const typeName = getChannelTypeName(channel);
  const nsfw = channel.nsfw ? 'Yes' : 'No';
  const slowmode = channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'Off';
  const status = getChannelStatus(channel, guild);
  const isVoice = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;

  const fields = [
    { name: 'Channel ID', value: channel.id, inline: true },
    { name: 'Type', value: typeName, inline: true },
    { name: 'Category', value: categoryName, inline: true },
    { name: 'Creation', value: created, inline: true },
    { name: 'NSFW', value: nsfw, inline: true },
    { name: 'Slowmode', value: slowmode, inline: true },
    { name: 'Status', value: status, inline: true },
  ];

  if (isVoice) {
    const bitrateKbps = channel.bitrate ? Math.floor(channel.bitrate / 1000) : 0;
    fields.push(
      { name: 'Bitrate', value: `${bitrateKbps}kbps`, inline: true },
      { name: 'User Limit', value: channel.userLimit ? String(channel.userLimit) : 'Unlimited', inline: true },
    );
  }

  const embed = {
    title: '✦ Channel: {channel_name}',
    color: EMBED_COLORS.CHANNEL_INFO,
    timestamp: new Date().toISOString(),
    fields,
  };
  if (channel.topic) embed.description = `**Topic:** ${channel.topic}`;
  if (options.imageURL) embed.image = { url: options.imageURL };

  return resolveEmbed(embed, { guild, channel });
}
