import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { buildChannelInfoComponents } from '../utils/components.js';
import { mainImageURL } from '../config.js';
import { getEmbedBuilder } from '../embedRoutes.js';

export async function buildChannelInfoPayload(channel, guild) {
  if (!channel || !guild || channel.type === ChannelType.GuildCategory) {
    return null;
  }

  const buildEmbed = getEmbedBuilder('ChannelInfo');
  const embed = buildEmbed ? await buildEmbed(channel, guild, { imageURL: mainImageURL }) : null;
  if (!embed) return null;

  const components = buildChannelInfoComponents(channel.id, channel, guild);
  return { embeds: [embed], components };
}

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  let channel = interaction.options?.get('target')?.channel ?? interaction.channel;
  if (!channel && actionContext?.targetId) channel = guild.channels.cache.get(actionContext.targetId);
  if (typeof channel === 'string') channel = guild.channels.cache.get(channel);
  if (!channel || channel.type === ChannelType.GuildCategory) {
    await interaction.editReply({ content: api.formatEphemeralContent('Channel not found.') });
    return;
  }

  const payload = await buildChannelInfoPayload(channel, guild);
  if (!payload) {
    await interaction.editReply({ content: api.formatEphemeralContent('Could not create embed.') }).catch(() => {});
    return;
  }

  await interaction.editReply(payload);
}
