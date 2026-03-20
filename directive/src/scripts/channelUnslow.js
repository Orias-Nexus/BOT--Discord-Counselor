import * as api from '../api.js';

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

  try {
    await channel.setRateLimitPerUser(0);
    await api.replyOrEdit(interaction, api.formatEphemeralContent(`Removed slowmode from #${channel.name}.`));
  } catch {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Could not remove slowmode. Check bot permissions.'));
  }
}
