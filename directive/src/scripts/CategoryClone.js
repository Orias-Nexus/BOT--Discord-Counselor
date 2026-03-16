import { ChannelType } from 'discord.js';
import * as api from '../api.js';

const SUCCESS_MESSAGE = 'Completed Clone {Category Name}.';

export async function run(interaction, client, actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  let category = interaction.options?.get('target')?.channel;
  if (!category && actionContext?.targetId) category = guild.channels.cache.get(actionContext.targetId);
  if (category?.type !== ChannelType.GuildCategory) {
    const ch = interaction.channel;
    category = ch?.parentId ? guild.channels.cache.get(ch.parentId) : null;
  }
  if (!category || category.type !== ChannelType.GuildCategory) {
    await interaction.editReply({ content: api.formatEphemeralContent('Category not found.') });
    return;
  }
  const number = Math.max(1, Math.min(10, Number(interaction.options?.get('number')?.value) || 1));
  const cloned = [];
  for (let i = 0; i < number; i++) {
    const clone = await guild.channels.create({
      name: category.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: category.permissionOverwrites.cache,
    }).catch(() => null);
    if (clone) {
      const children = guild.channels.cache.filter((c) => c.parentId === category.id);
      for (const child of children.values()) {
        await guild.channels.create({
          name: child.name,
          type: child.type,
          parent: clone.id,
          permissionOverwrites: child.permissionOverwrites.cache,
        }).catch(() => {});
      }
      cloned.push(clone.name);
    }
  }
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { 'Category Name': category.name }));
  await interaction.editReply({ content });
}
