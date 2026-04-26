import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { messageSender } from './messageSender.js';

/**
 * Core test-message logic — shared by slash commands and web dashboard.
 * Validates config, fetches embed, sends to configured channel.
 * @param {{ guild: import('discord.js').Guild, messagesType: string, member?: import('discord.js').GuildMember|null }} params
 * @returns {Promise<{ ok: boolean, resultMeta?: object, error?: string }>}
 */
export async function executeTest({ guild, messagesType, member = null }) {
  let config;
  try {
    config = await api.getMessageByType(guild.id, messagesType);
  } catch {
    config = null;
  }

  if (!config) return { ok: false, error: `No ${messagesType} config found.` };

  const channelId = config.channel_id ?? null;
  if (!channelId || channelId === '0') return { ok: false, error: `No ${messagesType} channel set.` };
  if (!config.embed_id) return { ok: false, error: `No ${messagesType} embed set.` };

  const embedRow = await api.getEmbed(guild.id, config.embed_id).catch(() => null);
  if (!embedRow?.embed) return { ok: false, error: 'Embed not found. It may have been deleted.' };

  const result = await messageSender(guild, channelId, embedRow.embed, { member, guild });
  if (!result.ok) return { ok: false, error: result.reason || 'Send failed.' };

  return { ok: true, resultMeta: { messageId: result.messageId, channelId } };
}

/**
 * Test sending a configured event message (Greeting / Leaving / Boosting / Leveling / Logging).
 * Guides the user if channel or embed is not set up yet.
 */
export async function testEventMessage(interaction, messagesType) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const member = interaction.member ?? interaction.user;
  const result = await executeTest({ guild, messagesType, member });

  if (!result.ok) {
    const typeLower = messagesType.toLowerCase();
    let hint = result.error;
    if (result.error.includes('config found')) hint += ` Use \`/${typeLower}channel\` and \`/${typeLower}message\` to set up.`;
    else if (result.error.includes('channel set')) hint += ` Use \`/${typeLower}channel\` to set a channel.`;
    else if (result.error.includes('embed set')) hint += ` Use \`/${typeLower}message\` to assign an embed.`;

    await interaction.editReply({ content: api.formatEphemeralContent(hint) });
    return;
  }

  const channel = guild.channels.cache.get(result.resultMeta.channelId);
  const channelMention = channel ? `<#${channel.id}>` : `\`${result.resultMeta.channelId}\``;
  await interaction.editReply({
    content: api.formatEphemeralContent(`Test ${messagesType} message sent to ${channelMention}.`),
  });
}
