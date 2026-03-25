import { ChannelType } from '../discord.js';
import * as api from '../api.js';

const SLOWMODE_TYPES = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.GuildForum,
  ChannelType.GuildVoice,
  ChannelType.GuildStageVoice,
];

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

  let channel = interaction.options?.get('target')?.channel ?? interaction.channel;
  if (!channel && actionContext?.targetId) channel = guild.channels.cache.get(actionContext.targetId);
  if (typeof channel === 'string') channel = guild.channels.cache.get(channel);
  if (!channel) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Channel not found.'));
    return;
  }

  if (!SLOWMODE_TYPES.includes(channel.type)) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('This channel type does not support slowmode.'));
    return;
  }

  const raw = getOptionOrModal(interaction, actionContext, 'seconds');
  const seconds = raw != null ? Math.max(0, Math.min(21600, parseInt(raw, 10) || 0)) : null;
  if (seconds == null) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Enter a slowmode value in seconds (0-21600).'));
    return;
  }

  try {
    await channel.setRateLimitPerUser(seconds);
    const label = seconds > 0 ? `${seconds}s` : 'off';
    await api.replyOrEdit(interaction, api.formatEphemeralContent(`Set slowmode to ${label} on #${channel.name}.`));
  } catch {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Could not set slowmode. Check bot permissions.'));
  }
}
