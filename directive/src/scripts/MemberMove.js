import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { getEmbedContent } from '../embedDefaults.js';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  const targetOption = interaction.options?.get('target');
  const channelOption = interaction.options?.get('channel');
  const voiceChannel = channelOption?.channel;
  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Cần chọn một kênh thoại (channel).'));
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
  let moved = 0;
  for (const m of members) {
    const ok = await m.voice.setChannel(voiceChannel).then(() => true).catch(() => false);
    if (ok) moved++;
  }
  const content = api.formatEphemeralContent(api.replacePlaceholders(
    getEmbedContent('MemberMove') ?? 'Moved {Number of Member} to {Channel Name}.',
    { 'Number of Member': moved, 'Channel Name': voiceChannel.name }
  ));
  await api.replyOrEdit(interaction, content);
}
