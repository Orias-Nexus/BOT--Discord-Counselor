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
    await interaction.editReply({ content: 'Không tìm thấy kênh.' });
    return;
  }
  const number = Math.max(1, Math.min(10, Number(interaction.options?.get('number')?.value) || 1));
  for (let i = 0; i < number; i++) {
    await channel.clone().catch(() => {});
  }
  const content = api.formatEphemeralContent(
    ((await api.getFunction('ChannelClone').catch(() => null))?.embed?.content ?? 'Completed Clone {Channel Name}.').replace(/\{Channel Name\}/g, channel.name)
  );
  await interaction.editReply({ content });
}
