import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { buildChannelInfoComponents } from '../utils/components.js';
import { mainImageURL } from '../config.js';
import { getEmbedBuilder } from '../embedRoutes.js';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  let channel = interaction.options?.get('target')?.channel ?? interaction.channel;
  if (!channel && actionContext?.targetId) channel = guild.channels.cache.get(actionContext.targetId);
  if (typeof channel === 'string') channel = guild.channels.cache.get(channel);
  if (!channel || channel.type === ChannelType.GuildCategory) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tìm thấy kênh.') });
    return;
  }
  const buildEmbed = getEmbedBuilder('ChanelInfo');
  const embed = buildEmbed ? await buildEmbed(channel, guild, { imageURL: mainImageURL }) : null;
  if (!embed) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tạo được embed.') }).catch(() => {});
    return;
  }
  const { row } = buildChannelInfoComponents(channel.id, channel, guild);
  await interaction.editReply({ embeds: [embed], components: row ? [row] : [] });
}
