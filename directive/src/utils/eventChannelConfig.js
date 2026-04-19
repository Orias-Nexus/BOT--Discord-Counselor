import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { resolveString } from '../embeds/.embedContext.js';
import { sendAuditLog } from './auditLogger.js';

/**
 * Shared handler for *Channel scripts (GreetingChannel, LeavingChannel, BoostingChannel, LevelingChannel, LoggingChannel).
 * Sets the channel for a given message type.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('discord.js').Client} client
 * @param {object|null} actionContext
 * @param {'Greeting'|'Leaving'|'Boosting'|'Leveling'|'Logging'} messageType
 */
export async function setEventChannel(interaction, client, actionContext, messageType) {
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
    await api.setMessageChannel(guild.id, messageType, channel.id);
    const text = await resolveString(`Completed Set {channel_name} as ${messageType} Channel`, { guild, channel });
    await interaction.editReply({ content: text, flags: MessageFlags.Ephemeral }).catch(() => {});

    await sendAuditLog(guild, {
      action: `${messageType} Channel Configured`,
      executor: interaction.user,
      color: '#3498db',
      fields: [{ name: 'Channel', value: channel.toString(), inline: true }]
    });
  } catch (err) {
    if (err.message && err.message.startsWith('LIMIT_REACHED')) {
      const msg = '⚠️ This feature limit has been reached for your server tier. Please upgrade to unlock more!';
      await interaction.editReply({ content: api.formatEphemeralContent(msg), flags: MessageFlags.Ephemeral }).catch(() => {});
      return;
    }
    console.error(`[${messageType}Channel]`, err);
    await interaction.editReply({ content: api.formatEphemeralContent('Update failed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
