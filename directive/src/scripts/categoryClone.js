import { ChannelType } from '../discord.js';
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
  const childrenInOrder = guild.channels.cache
    .filter((channel) => channel.parentId === category.id)
    .sort((a, b) => a.rawPosition - b.rawPosition);

  for (let i = 0; i < number; i++) {
    const clonedCategory = await category.clone({
      name: category.name,
      reason: `CategoryClone by ${interaction.user?.tag ?? interaction.user?.id ?? 'unknown'}`,
    }).catch(() => null);
    if (!clonedCategory || clonedCategory.type !== ChannelType.GuildCategory) continue;

    // Giữ vị trí category tương ứng (clone thường đã gần đúng, nhưng set lại để ổn định).
    await clonedCategory.setPosition(category.rawPosition).catch(() => {});

    for (const child of childrenInOrder.values()) {
      const clonedChild = await child
        .clone({
          name: child.name,
          reason: `CategoryClone child of ${category.id}`,
        })
        .catch(() => null);

      if (!clonedChild) continue;

      // Đưa vào category mới và giữ overwrite riêng của channel nếu có.
      await clonedChild.setParent(clonedCategory.id, { lockPermissions: false }).catch(() => {});
      await clonedChild.setPosition(child.rawPosition).catch(() => {});
    }
  }
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { 'Category Name': category.name }));
  await interaction.editReply({ content });
}
