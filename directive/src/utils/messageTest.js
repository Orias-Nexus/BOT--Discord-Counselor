import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { messageSender } from './messageSender.js';

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

  const typeLower = messagesType.toLowerCase();

  let config;
  try {
    config = await api.getMessageByType(guild.id, messagesType);
  } catch {
    config = null;
  }

  if (!config) {
    await interaction.editReply({
      content: api.formatEphemeralContent(
        `No ${messagesType} config found. Use \`/${typeLower}channel\` and \`/${typeLower}message\` to set up.`
      ),
    });
    return;
  }

  const channelId = config.channel_id ?? null;
  if (!channelId || channelId === '0') {
    await interaction.editReply({
      content: api.formatEphemeralContent(
        `No ${messagesType} channel set. Use \`/${typeLower}channel\` to set a channel.`
      ),
    });
    return;
  }

  if (!config.embed_id) {
    await interaction.editReply({
      content: api.formatEphemeralContent(
        `No ${messagesType} embed set. Use \`/${typeLower}message\` to assign an embed.`
      ),
    });
    return;
  }

  const embedRow = await api.getEmbed(guild.id, config.embed_id).catch(() => null);
  if (!embedRow?.embed) {
    await interaction.editReply({
      content: api.formatEphemeralContent('Embed not found. It may have been deleted.'),
    });
    return;
  }

  try {
    const member = interaction.member ?? interaction.user;
    const result = await messageSender(guild, channelId, embedRow.embed, { member, guild });
    if (result.ok) {
      const channel = guild.channels.cache.get(channelId);
      const channelMention = channel ? `<#${channel.id}>` : `\`${channelId}\``;
      await interaction.editReply({
        content: api.formatEphemeralContent(`Test ${messagesType} message sent to ${channelMention}.`),
      });
    } else {
      await interaction.editReply({
        content: api.formatEphemeralContent(`Failed to send: ${result.reason}`),
      });
    }
  } catch (err) {
    console.error(`[${messagesType}Test]`, err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Failed to send test message.'),
    });
  }
}
