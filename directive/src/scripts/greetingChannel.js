<<<<<<< HEAD
import { setEventChannel } from '../utils/eventChannelConfig.js';

export async function run(interaction, client, actionContext) {
  await setEventChannel(interaction, client, actionContext, 'Greeting');
=======
import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { resolveString } from '../embeds/embedContext.js';

const MESSAGE_TYPE = 'Greeting';

export async function run(interaction, client, actionContext) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  const channel = interaction.options?.getChannel('channel') ?? actionContext?.channel ?? null;
  if (!channel) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Hãy chọn một kênh.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    await api.ensureServer(guild.id);
    await api.setMessageChannel(guild.id, MESSAGE_TYPE, channel.id);
    const text = await resolveString('Completed Set {channel_name} as Greeting Channel', { guild, channel });
    await interaction.editReply({ content: text, flags: MessageFlags.Ephemeral }).catch(() => {});
  } catch (err) {
    console.error('[GreetingChannel]', err);
    await interaction.editReply({ content: api.formatEphemeralContent('Không thể cập nhật.'), flags: MessageFlags.Ephemeral }).catch(() => {});
  }
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
}
