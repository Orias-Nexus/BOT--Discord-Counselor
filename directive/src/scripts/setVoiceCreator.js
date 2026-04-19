import { ChannelType, MessageFlags } from '../discord.js';
import * as api from '../api.js';

const CREATOR_CATEGORY_NAME = 'voice creator';
const CREATOR_CHANNEL_NAME = '🔹create voice';

export async function run(interaction, client, _actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let list = [];
  try {
    list = await api.getChannels(guild.id, 'Creator');
  } catch (err) {
    console.warn('[SetVoiceCreator] getChannels:', err?.message);
    await interaction.editReply({ content: api.formatEphemeralContent('Could not reach backend.') }).catch(() => {});
    return;
  }

  // We don't use absolute constants, we let backend handle limit through LIMIT_REACHED error

  let category = null;
  let voiceChannel = null;
  try {
    category = await guild.channels.create({
      name: CREATOR_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      reason: 'SetVoiceCreator: Creator category',
    });
    voiceChannel = await guild.channels.create({
      name: CREATOR_CHANNEL_NAME,
      type: ChannelType.GuildVoice,
      parent: category.id,
      reason: 'SetVoiceCreator: trigger channel',
    });
    await api.upsertChannel(guild.id, category.id, 'Creator', 0);
    await interaction.editReply({
      content: api.formatEphemeralContent(`Created category **${category.name}** and voice channel **${voiceChannel.name}**. Members joining this channel will get their own private channel.`),
    }).catch(() => {});
  } catch (err) {
    if (err.message && err.message.startsWith('LIMIT_REACHED')) {
      const msg = '⚠️ This feature limit has been reached for your server tier. Please upgrade to unlock more!';
      await interaction.editReply({ content: api.formatEphemeralContent(msg) }).catch(() => {});
      // clean up orphaned channels
      if (voiceChannel) await voiceChannel.delete().catch(()=>null);
      if (category) await category.delete().catch(()=>null);
      return;
    }
    console.warn('[SetVoiceCreator] create:', err?.message ?? err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Failed to create category or channel. Check bot permission "Manage Channels" or Backend connection.'),
    }).catch(() => {});
  }
}
