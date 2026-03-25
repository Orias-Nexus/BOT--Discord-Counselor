import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { messageSender } from '../utils/messageSender.js';

export async function run(interaction, client) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  const channel = interaction.options?.getChannel('channel') ?? interaction.channel;
  const channelId = channel?.id ?? null;
  if (!channelId) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Target channel not found.'));
    return;
  }

  const embedId = interaction.options?.getString('embed')?.trim() || null;
  const input = interaction.options?.getString('input')?.trim() || null;

  if ((embedId && input) || (!embedId && !input)) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Choose exactly one: embed or input.'));
    return;
  }

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    let embedPayload = null;

    if (input) {
      embedPayload = input;
    } else if (embedId) {
      const row = await api.getEmbed(guild.id, embedId);
      if (!row?.embed) {
        await interaction.editReply({
          content: api.formatEphemeralContent('Embed not found. Create one with /embedcreate first.'),
          flags: MessageFlags.Ephemeral,
        }).catch(() => {});
        return;
      }
      embedPayload = row.embed;
    }

    const res = await messageSender(guild, channelId, embedPayload, { guild, channel, member: interaction.member });
    if (!res.ok) {
      await interaction.editReply({ content: api.formatEphemeralContent(res.reason), flags: MessageFlags.Ephemeral }).catch(() => {});
      return;
    }

    await interaction.editReply({
      content: api.formatEphemeralContent(`Sent. Message ID: ${res.messageId}`),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  } catch (err) {
    console.error('[MessageSend]', err);
    await interaction.editReply({ content: api.formatEphemeralContent('Send failed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}

