import * as api from '../api.js';
import { getEmbedContent } from '../embedDefaults.js';

const SUCCESS_MESSAGE = 'Completed Sync {Channel Name}.';

export async function run(interaction, client, actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  let channel = interaction.options?.get('target')?.channel ?? interaction.channel;
  if (!channel && actionContext?.targetId) channel = guild.channels.cache.get(actionContext.targetId);
  if (typeof channel === 'string') channel = guild.channels.cache.get(channel);
  if (!channel) {
    await interaction.editReply({ content: api.formatEphemeralContent('Channel not found.') });
    return;
  }
  if (!channel.parentId) {
    await interaction.editReply({ content: api.formatEphemeralContent('Channel has no category, cannot sync.') });
    return;
  }
  await channel.lockPermissions().catch((err) => {
    console.error('[ChannelSync] lockPermissions', err?.code ?? err);
  });
  const content = api.formatEphemeralContent(SUCCESS_MESSAGE.replace(/\{Channel Name\}/g, channel.name));
  await interaction.editReply({ content });
}
