import { ChannelType } from 'discord.js';
import * as api from '../api.js';

const SUCCESS_MESSAGE = 'Published {Category Name}.';

export async function run(interaction, client, actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  let category = interaction.options?.get('target')?.channel ?? interaction.options?.get('target')?.value;
  if (!category && actionContext?.targetId) category = actionContext.targetId;
  if (typeof category === 'string') category = guild.channels.cache.get(category);
  if (category?.type !== ChannelType.GuildCategory) {
    const ch = interaction.channel;
    category = ch?.parentId ? guild.channels.cache.get(ch.parentId) : null;
  }
  if (!category) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tìm thấy danh mục.') });
    return;
  }
  await category.permissionOverwrites.edit(guild.id, { ViewChannel: true }).catch(() => {});
  const content = api.formatEphemeralContent(
    SUCCESS_MESSAGE.replace(/\{Category Name\}/g, category.name)
  );
  await interaction.editReply({ content });
}
