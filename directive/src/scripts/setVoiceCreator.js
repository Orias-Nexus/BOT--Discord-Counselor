import { ChannelType, MessageFlags } from '../discord.js';
import * as api from '../api.js';

const MAX_CREATOR = 1;
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

  const creatorCount = (list ?? []).length;
  if (creatorCount >= MAX_CREATOR) {
    await interaction.editReply({
      content: api.formatEphemeralContent('Maximum number of Voice Creator categories reached.'),
    }).catch(() => {});
    return;
  }

  try {
    const category = await guild.channels.create({
      name: CREATOR_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      reason: 'SetVoiceCreator: Creator category',
    });
    const voiceChannel = await guild.channels.create({
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
    console.warn('[SetVoiceCreator] create:', err?.message ?? err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Failed to create category or channel. Check bot permission "Manage Channels".'),
    }).catch(() => {});
  }
}
