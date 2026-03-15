import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { buildCategoryInfoComponents } from '../utils/components.js';
<<<<<<< HEAD:directive/src/scripts/categoryInfo.js
import { mainImageUrl } from '../config.js';
=======
import { mainImageURL } from '../config.js';
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.):directive/src/scripts/CategoryInfo.js
import { getEmbedBuilder } from '../embedRoutes.js';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
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
    await interaction.editReply({ content: api.formatEphemeralContent('Category not found.') });
    return;
  }
  const buildEmbed = getEmbedBuilder('CategoryInfo');
<<<<<<< HEAD:directive/src/scripts/categoryInfo.js
  const embed = buildEmbed ? await buildEmbed(category, guild, { imageURL: mainImageUrl }) : null;
  if (!embed) {
    await interaction.editReply({ content: api.formatEphemeralContent('Could not create embed.') }).catch(() => {});
    return;
  }
  const components = buildCategoryInfoComponents(category.id, category, guild);
  await interaction.editReply({ embeds: [embed], components });
=======
  const embed = buildEmbed ? await buildEmbed(category, guild, { imageURL: mainImageURL }) : null;
  if (!embed) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tạo được embed.') }).catch(() => {});
    return;
  }
  const { row } = buildCategoryInfoComponents(category.id, category, guild);
  await interaction.editReply({ embeds: [embed], components: row ? [row] : [] });
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.):directive/src/scripts/CategoryInfo.js
}
