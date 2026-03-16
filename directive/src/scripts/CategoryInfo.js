import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { buildCategoryInfoComponents } from '../utils/components.js';
import { mainImageURL } from '../config.js';
import { getEmbedBuilder } from '../embedRoutes.js';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  let category = interaction.options?.get('target')?.channel;
  if (!category && actionContext?.targetId) category = guild.channels.cache.get(actionContext.targetId);
  if (category?.type !== ChannelType.GuildCategory) {
    const channel = interaction.channel;
    category = channel?.parentId ? guild.channels.cache.get(channel.parentId) : null;
  }
  if (!category || category.type !== ChannelType.GuildCategory) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tìm thấy danh mục.') });
    return;
  }
  const buildEmbed = getEmbedBuilder('CategoryInfo');
  const embed = buildEmbed ? await buildEmbed(category, guild, { imageURL: mainImageURL }) : null;
  if (!embed) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tạo được embed.') }).catch(() => {});
    return;
  }
  const { row } = buildCategoryInfoComponents(category.id, category, guild);
  await interaction.editReply({ embeds: [embed], components: row ? [row] : [] });
}
