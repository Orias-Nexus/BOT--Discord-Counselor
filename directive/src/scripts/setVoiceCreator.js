import { ChannelType, MessageFlags } from '../discord.js';
import * as api from '../api.js';

const CREATOR_CATEGORY_NAME = 'voice creator';
const CREATOR_CHANNEL_NAME = '🔹create voice';

/**
 * Core voice creator logic — shared by slash commands and web dashboard.
 * Creates category + trigger voice channel and registers in backend.
 * @param {{ guild: import('discord.js').Guild }} params
 * @returns {Promise<{ ok: boolean, resultMeta?: object, error?: string }>}
 */
export async function execute({ guild }) {
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
    return { ok: true, resultMeta: { categoryId: category.id, voiceChannelId: voiceChannel.id, categoryType: 'Creator' } };
  } catch (err) {
    if (err.message?.startsWith('LIMIT_REACHED')) {
      if (voiceChannel) await voiceChannel.delete().catch(() => null);
      if (category) await category.delete().catch(() => null);
      return { ok: false, error: 'LIMIT_REACHED' };
    }
    console.warn('[SetVoiceCreator] create:', err?.message ?? err);
    if (voiceChannel) await voiceChannel.delete().catch(() => null);
    if (category) await category.delete().catch(() => null);
    return { ok: false, error: 'Failed to create category or channel. Check bot permission "Manage Channels".' };
  }
}

export async function run(interaction, client, _actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    await api.getChannels(guild.id, 'Creator');
  } catch (err) {
    console.warn('[SetVoiceCreator] getChannels:', err?.message);
    await interaction.editReply({ content: api.formatEphemeralContent('Could not reach backend.') }).catch(() => {});
    return;
  }

  const result = await execute({ guild });

  if (!result.ok) {
    const msg = result.error === 'LIMIT_REACHED'
      ? '⚠️ This feature limit has been reached for your server tier. Please upgrade to unlock more!'
      : result.error;
    await interaction.editReply({ content: api.formatEphemeralContent(msg) }).catch(() => {});
    return;
  }

  await interaction.editReply({
    content: api.formatEphemeralContent(`Created category **${CREATOR_CATEGORY_NAME}** and voice channel **${CREATOR_CHANNEL_NAME}**. Members joining this channel will get their own private channel.`),
  }).catch(() => {});
}
