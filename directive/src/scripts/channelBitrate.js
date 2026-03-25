import { ChannelType } from '../discord.js';
import * as api from '../api.js';

const VOICE_TYPES = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];
const MIN_BITRATE = 8000;

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
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Only voice channels support bitrate.'));
    return;
  }

  const raw = getOptionOrModal(interaction, actionContext, 'bitrate');
  const kbps = raw != null ? parseInt(raw, 10) : NaN;
  if (isNaN(kbps) || kbps < 0) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Enter a valid bitrate in kbps (0 = max).'));
    return;
  }

  const maxBitrate = guild.maximumBitrate ?? 96000;
  const targetBps = kbps === 0 ? maxBitrate : Math.min(Math.max(kbps * 1000, MIN_BITRATE), maxBitrate);

  try {
    await channel.setBitrate(targetBps);
    await api.replyOrEdit(
      interaction,
      api.formatEphemeralContent(`Set bitrate to ${Math.floor(targetBps / 1000)}kbps on #${channel.name}.`)
    );
  } catch {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Could not set bitrate. Check bot permissions.'));
  }
}
