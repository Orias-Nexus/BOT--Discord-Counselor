import { ChannelType } from 'discord.js';
import { EMBED_COLORS } from './schema.js';
import { getChannelStatus } from './utils.js';

function getCategoryChannelCounts(guild, categoryId) {
  const children = guild.channels.cache.filter((c) => c.parentId === categoryId);
  const chat = children.filter(
    (c) =>
      c.type === ChannelType.GuildText ||
      c.type === ChannelType.GuildAnnouncement ||
      c.type === ChannelType.GuildForum
  ).size;
  const voice = children.filter(
    (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice
  ).size;
  const other = children.size - chat - voice;
  return { chat, voice, other };
}

/**
 * Trả về embed data Category Info. channel.send({ embeds: [data] }) hoặc editReply({ embeds: [data] }).
 * @param {import('discord.js').Channel} category (GuildCategory)
 * @param {import('discord.js').Guild} guild
 * @param {{ imageURL?: string }} options
 * @returns {object}
 */
export function getCategoryInfoEmbed(category, guild, options = {}) {
  const counts = getCategoryChannelCounts(guild, category.id);
  const channelLine = `Chat: ${counts.chat} · Voice: ${counts.voice} · Other: ${counts.other}`;
  const status = getChannelStatus(category, guild);

  const embed = {
    title: `✦ ${category.name}`,
    color: EMBED_COLORS.CATEGORY_INFO,
    timestamp: new Date().toISOString(),
    fields: [
      { name: 'ID', value: category.id, inline: true },
      { name: 'Name', value: category.name, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Chanel', value: channelLine, inline: true },
      { name: 'Status', value: status, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
    ],
  };
  if (options.imageURL) embed.image = { url: options.imageURL };
  return embed;
}
