import { ChannelType } from '../discord.js';
import * as api from '../api.js';

const NSFW_ALLOWED_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum];
const SUCCESS_MESSAGE = 'Changed channel {Channel Name} to NSFW.';

export async function run(interaction, client, actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  let channel = interaction.options?.get('target')?.channel ?? interaction.channel;
  if (!channel && actionContext?.targetId) channel = guild.channels.cache.get(actionContext.targetId);
  if (typeof channel === 'string') channel = guild.channels.cache.get(channel);
  if (!channel) {
    await interaction.editReply({ content: api.formatEphemeralContent('Channel not found.') });
    return;
  }
  if (!NSFW_ALLOWED_TYPES.includes(channel.type)) {
    await interaction.editReply({
      content: api.formatEphemeralContent('Only text, announcement or forum channels can be set NSFW.'),
    });
    return;
  }
  try {
    await channel.edit({ nsfw: true });
  } catch (err) {
    await interaction.editReply({
      content: api.formatEphemeralContent(
        'Could not set NSFW. Check bot "Manage Channels" on this channel.'
      ),
    });
    return;
  }
  const content = api.formatEphemeralContent(
    SUCCESS_MESSAGE.replace(/\{Channel Name\}/g, channel.name)
  );
  await interaction.editReply({ content });
}
