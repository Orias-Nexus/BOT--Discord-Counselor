import { ChannelType } from 'discord.js';
import * as api from '../api.js';

const NSFW_ALLOWED_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum];

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
  if (!NSFW_ALLOWED_TYPES.includes(channel.type)) {
    await interaction.editReply({
      content: api.formatEphemeralContent('Chỉ kênh văn bản, thông báo hoặc forum mới đặt được NSFW.'),
    });
    return;
  }
  try {
    await channel.edit({ nsfw: true });
  } catch (err) {
    await interaction.editReply({
      content: api.formatEphemeralContent(
        'Không đổi được NSFW. Kiểm tra quyền "Manage Channels" của bot trên kênh này.'
      ),
    });
    return;
  }
  const content = api.formatEphemeralContent(
    ((await api.getFunction('ChannelNSFW').catch(() => null))?.embed?.content ?? 'Changed channel {Channel Name} to NSFW.').replace(/\{Channel Name\}/g, channel.name)
  );
  await interaction.editReply({ content });
}
