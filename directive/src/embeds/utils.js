import { ChannelType, PermissionFlagsBits } from 'discord.js';

export function formatShortDate(date) {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getGuildTypeString(guild) {
  if (guild.features?.includes('COMMUNITY')) return 'Community Server';
  return 'Guild';
}

export const CHANNEL_TYPE_NAMES = {
  [ChannelType.GuildText]: 'Text Channel',
  [ChannelType.GuildVoice]: 'Voice Channel',
  [ChannelType.GuildCategory]: 'Category',
  [ChannelType.GuildAnnouncement]: 'Announcement',
  [ChannelType.GuildStageVoice]: 'Stage Voice',
  [ChannelType.GuildForum]: 'Forum',
};

export function isChannelPublic(channel, guild) {
  const overwrite = channel.permissionOverwrites?.cache?.get(guild.id);
  if (!overwrite) return true;
  return !overwrite.deny?.has(PermissionFlagsBits.ViewChannel);
}

export function getChannelStatus(channel, guild) {
  return isChannelPublic(channel, guild) ? 'Public' : 'Private';
}

export function getChannelTypeName(channel) {
  return CHANNEL_TYPE_NAMES[channel.type] ?? 'Unknown';
}
