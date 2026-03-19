import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { resolveString } from '../embeds/.embedContext.js';

const MESSAGE_TYPE = 'Leaving';

export async function run(interaction, client, actionContext) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const channel = interaction.options?.getChannel('channel') ?? actionContext?.channel ?? null;
  if (!channel) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Select a channel.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    await api.ensureServer(guild.id);
    await api.setMessageChannel(guild.id, MESSAGE_TYPE, channel.id);
    const text = await resolveString('Completed Set {channel_name} as Leaving Channel', { guild, channel });
    await interaction.editReply({ content: text, flags: MessageFlags.Ephemeral }).catch(() => {});
  } catch (err) {
    console.error('[LeavingChannel]', err);
    await interaction.editReply({ content: api.formatEphemeralContent('Update failed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
