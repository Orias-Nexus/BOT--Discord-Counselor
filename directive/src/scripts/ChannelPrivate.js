import * as api from '../api.js';

export async function run(interaction, client, actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  let channel = interaction.options?.get('target')?.channel ?? interaction.channel;
  if (!channel && actionContext?.targetId) channel = guild.channels.cache.get(actionContext.targetId);
  if (typeof channel === 'string') channel = guild.channels.cache.get(channel);
  if (!channel) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tìm thấy kênh.') });
    return;
  }
  await channel.permissionOverwrites.edit(guild.id, { ViewChannel: false }).catch(() => {});
  const content = api.formatEphemeralContent(
    ((await api.getFunction('ChannelPrivate').catch(() => null))?.embed?.content ?? 'Privated {Channel Name}.').replace(/\{Channel Name\}/g, channel.name)
  );
  await interaction.editReply({ content });
}
