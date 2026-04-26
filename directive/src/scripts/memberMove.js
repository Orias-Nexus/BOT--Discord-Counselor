import { ChannelType } from '../discord.js';
import * as api from '../api.js';

const SUCCESS_MESSAGE = 'Moved {Number of Member} to {Channel Name}.';

/**
 * Core move logic — shared by slash commands and web dashboard.
 * Moves one member (or all non-bot voice members if no target) to a voice channel.
 * @param {{ guild: import('discord.js').Guild, members: import('discord.js').GuildMember[], channelId: string }} params
 * @returns {Promise<{ ok: boolean, resultMeta?: object, error?: string }>}
 */
export async function execute({ guild, members, channelId }) {
  const voiceChannel = await guild.channels.fetch(channelId).catch(() => null);
  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    return { ok: false, error: 'Target is not a voice channel.' };
  }

  let moved = 0;
  for (const m of members) {
    const ok = await m.voice.setChannel(voiceChannel).then(() => true).catch(() => false);
    if (ok) moved++;
  }

  return { ok: true, resultMeta: { moved, channelId, channelName: voiceChannel.name } };
}

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  const targetOption = interaction.options?.get('target');
  const channelOption = interaction.options?.get('channel');
  const voiceChannel = channelOption?.channel;
  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Select a voice channel (channel).'));
    return;
  }

  let members = [];
  if (targetOption?.member) {
    members = [targetOption.member];
  } else if (targetOption?.user) {
    const m = await guild.members.fetch(targetOption.user.id).catch(() => null);
    if (m) members = [m];
  } else if (actionContext?.targetId) {
    const m = await guild.members.fetch(actionContext.targetId).catch(() => null);
    if (m) members = [m];
  } else {
    members = Array.from(guild.members.cache.filter((m) => !m.user.bot && m.voice?.channelId).values());
  }

  const result = await execute({ guild, members, channelId: voiceChannel.id });

  if (!result.ok) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent(result.error));
    return;
  }

  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, {
    'Number of Member': result.resultMeta.moved,
    'Channel Name': voiceChannel.name,
  }));
  await api.replyOrEdit(interaction, content);
}
