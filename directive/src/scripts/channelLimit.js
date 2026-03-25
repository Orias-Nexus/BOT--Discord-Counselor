import { ChannelType } from '../discord.js';
import * as api from '../api.js';

const VOICE_TYPES = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];

function getOptionOrModal(interaction, actionContext, key) {
  const fromOptions = interaction.options?.get?.(key)?.value;
  if (fromOptions !== undefined && fromOptions !== null) return fromOptions;
  return actionContext?.modalValues?.[key] ?? null;
}

export async function run(interaction, client, actionContext = {}) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  let channel = interaction.options?.get('target')?.channel ?? null;
  if (!channel && actionContext?.targetId) channel = guild.channels.cache.get(actionContext.targetId);
  if (typeof channel === 'string') channel = guild.channels.cache.get(channel);
  if (!channel) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Channel not found.'));
    return;
  }

  if (!VOICE_TYPES.includes(channel.type)) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Only voice channels support user limit.'));
    return;
  }

  const raw = getOptionOrModal(interaction, actionContext, 'limit');
  const limit = raw != null && String(raw).trim() !== '' ? Math.max(0, Math.min(99, parseInt(raw, 10) || 0)) : 0;

  try {
    await channel.setUserLimit(limit);
    const label = limit > 0 ? String(limit) : 'unlimited';
    await api.replyOrEdit(
      interaction,
      api.formatEphemeralContent(`Set user limit to ${label} on #${channel.name}.`)
    );
  } catch {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Could not set user limit. Check bot permissions.'));
  }
}
