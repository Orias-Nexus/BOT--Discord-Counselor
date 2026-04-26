import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { messageSender } from '../utils/messageSender.js';

/**
 * Core send-message logic — shared by slash commands and web dashboard.
 * If both embedId and content are provided, sends embed first, then text.
 * @param {{ guild: import('discord.js').Guild, channelId: string, embedId?: string|null, content?: string|null, member?: import('discord.js').GuildMember|null }} params
 * @returns {Promise<{ ok: boolean, resultMeta?: object, error?: string }>}
 */
export async function execute({ guild, channelId, embedId = null, content = null, member = null }) {
  if (!channelId) return { ok: false, error: 'Missing channel.' };

  const sent = [];

  if (embedId) {
    const row = await api.getEmbed(guild.id, embedId).catch(() => null);
    if (!row?.embed) return { ok: false, error: 'Embed not found.' };
    const result = await messageSender(guild, channelId, row.embed, { guild, member });
    if (!result.ok) return { ok: false, error: result.reason || 'Embed send failed.' };
    sent.push(result.messageId);
  }

  if (content) {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased?.()) return { ok: false, error: 'Channel is not text-based.' };
    const msg = await channel.send({ content: String(content) });
    sent.push(msg.id);
  }

  if (sent.length === 0) return { ok: false, error: 'Nothing to send (no embed or content).' };

  return { ok: true, resultMeta: { messageIds: sent } };
}

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

  const result = await execute({ guild, channelId, embedId, content: input, member: interaction.member });

  if (!result.ok) {
    await interaction.editReply({
      content: api.formatEphemeralContent(result.error),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
    return;
  }

  await interaction.editReply({
    content: api.formatEphemeralContent(`Sent. Message ID: ${result.resultMeta.messageId}`),
    flags: MessageFlags.Ephemeral,
  }).catch(() => {});
}
