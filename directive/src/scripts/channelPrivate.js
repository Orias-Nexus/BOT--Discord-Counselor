import { ChannelType } from 'discord.js';
import * as api from '../api.js';

const SUCCESS_MESSAGE = 'Privated {Channel Name}.';

const SUCCESS_MESSAGE = 'Privated {Channel Name}.';

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
  await channel.permissionOverwrites.edit(guild.id, { ViewChannel: false }).catch(() => {});
<<<<<<< HEAD:directive/src/scripts/channelPrivate.js
 const content = api.formatEphemeralContent(
=======
  const content = api.formatEphemeralContent(
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.):directive/src/scripts/ChannelPrivate.js
    SUCCESS_MESSAGE.replace(/\{Channel Name\}/g, channel.name)
  );
  await interaction.editReply({ content });
}
