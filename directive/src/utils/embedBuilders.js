import { EmbedBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { mainImageURL } from '../config.js';

const SERVER_INFO_COLOR = 0xfcfcfc;
const CATEGORY_INFO_COLOR = 0xfdfcfa;
const CHANNEL_INFO_COLOR = 0xfbfcf8;
const MEMBER_INFO_COLOR = 0xf5f5f5;

const STATUS_COLORS = {
  Good: 0x57f287,
  Warn: 0xfee75c,
  Warning: 0xfee75c,
  Mute: 0xed4245,
  Lock: 0x992d22,
  Locked: 0x992d22,
};

const CHANNEL_TYPE_NAMES = {
  [ChannelType.GuildText]: 'Text Channel',
  [ChannelType.GuildVoice]: 'Voice Channel',
  [ChannelType.GuildCategory]: 'Category',
  [ChannelType.GuildAnnouncement]: 'Announcement',
  [ChannelType.GuildStageVoice]: 'Stage Voice',
  [ChannelType.GuildForum]: 'Forum',
};

export function formatShortDate(date) {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getGuildTypeString(guild) {
  if (guild.features?.includes('COMMUNITY')) return 'Community Server';
  return 'Guild';
}

function getStatusColor(status) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.Good;
}

function isChannelPublic(channel, guild) {
  const overwrite = channel.permissionOverwrites?.cache?.get(guild.id);
  if (!overwrite) return true;
  return !overwrite.deny?.has(PermissionFlagsBits.ViewChannel);
}

function getChannelStatus(channel, guild) {
  return isChannelPublic(channel, guild) ? 'Public' : 'Private';
}

function getChannelTypeName(channel) {
  return CHANNEL_TYPE_NAMES[channel.type] ?? 'Unknown';
}

export function buildServerInfoEmbed(guild) {
  const chatCount = guild.channels.cache.filter(
    (c) =>
      c.type === ChannelType.GuildText ||
      c.type === ChannelType.GuildAnnouncement ||
      c.type === ChannelType.GuildForum
  ).size;
  const voiceCount = guild.channels.cache.filter(
    (c) =>
      c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice
  ).size;
  const categoryCount = guild.channels.cache.filter(
    (c) => c.type === ChannelType.GuildCategory
  ).size;
  const memberCount = guild.memberCount ?? guild.members.cache.size;
  const rolesCount = guild.roles.cache.size;
  const boostCount = guild.premiumSubscriptionCount ?? 0;
  const stickerCount = guild.stickers.cache.size;
  const emojiCount = guild.emojis.cache.size;
  const soundCount = guild.soundboardSounds?.cache?.size ?? 0;
  const description = guild.description ? guild.description.slice(0, 2048) : null;

  const embed = new EmbedBuilder()
    .setColor(SERVER_INFO_COLOR)
    .setTitle(`✦ ${guild.name}`)
    .setThumbnail(guild.iconURL({ size: 256 }))
    .addFields(
      { name: 'ID', value: guild.id, inline: true },
      { name: 'Name', value: guild.name, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      {
        name: 'Created At',
        value: formatShortDate(guild.createdAt),
        inline: true,
      },
      { name: 'Type', value: getGuildTypeString(guild), inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      {
        name: 'Channel',
        value: `Chat: ${chatCount} | Voice: ${voiceCount}`,
        inline: true,
      },
      { name: 'Category', value: String(categoryCount), inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Member', value: String(memberCount), inline: true },
      { name: 'Role', value: String(rolesCount), inline: true },
      { name: 'Boost', value: String(boostCount), inline: true },
      { name: 'Sticker', value: String(stickerCount), inline: true },
      { name: 'Emoji', value: String(emojiCount), inline: true },
      { name: 'Sound', value: String(soundCount), inline: true }
    )
    // .setTimestamp();

  if (description) embed.setFooter({ text: description });
  if (mainImageURL) embed.setImage(mainImageURL);
  return embed;
}

export function buildChannelInfoEmbed(channel, guild) {
  const created = channel.createdAt
    ? formatShortDate(channel.createdAt)
    : 'N/A';
  const categoryName = channel.parent ? channel.parent.name : 'None';
  const typeName = getChannelTypeName(channel);
  const nsfw = channel.nsfw ? 'Yes' : 'No';
  const slowmode = channel.rateLimitPerUser
    ? `${channel.rateLimitPerUser}s`
    : 'Off';
  const status = getChannelStatus(channel, guild);

  const embed = new EmbedBuilder()
    .setColor(CHANNEL_INFO_COLOR)
    .setTitle(`✦ Channel: ${channel.name}`)
    .addFields(
      { name: 'Channel ID', value: channel.id, inline: true },
      { name: 'Type', value: typeName, inline: true },
      { name: 'Category', value: categoryName, inline: true },
      { name: 'Creation', value: created, inline: true },
      { name: 'NSFW', value: nsfw, inline: true },
      { name: 'Slowmode', value: slowmode, inline: true },
      { name: 'Status', value: status, inline: true }
    )
    .setTimestamp();

  if (channel.topic) {
    embed.setDescription(`**Topic:** ${channel.topic}`);
  }
  if (mainImageURL) embed.setImage(mainImageURL);
  return embed;
}

function getCategoryChannelCounts(guild, categoryId) {
  const children = guild.channels.cache.filter(
    (c) => c.parentId === categoryId
  );
  const chat = children.filter(
    (c) =>
      c.type === ChannelType.GuildText ||
      c.type === ChannelType.GuildAnnouncement ||
      c.type === ChannelType.GuildForum
  ).size;
  const voice = children.filter(
    (c) =>
      c.type === ChannelType.GuildVoice ||
      c.type === ChannelType.GuildStageVoice
  ).size;
  const other = children.size - chat - voice;
  return { chat, voice, other };
}

function getCategoryStatus(category, guild) {
  return getChannelStatus(category, guild);
}

export function buildCategoryInfoEmbed(category, guild) {
  const counts = getCategoryChannelCounts(guild, category.id);
  const channelLine = `Chat: ${counts.chat} · Voice: ${counts.voice} · Other: ${counts.other}`;
  const status = getCategoryStatus(category, guild);

  const embed = new EmbedBuilder()
    .setColor(CATEGORY_INFO_COLOR)
    .setTitle(`✦ ${category.name}`)
    .addFields(
      { name: 'ID', value: category.id, inline: true },
      { name: 'Name', value: category.name, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Chanel', value: channelLine, inline: true },
      { name: 'Status', value: status, inline: true },
      { name: '\u200B', value: '\u200B', inline: true }
    )
    .setTimestamp();

  if (mainImageURL) embed.setImage(mainImageURL);
  return embed;
}

function formatMemberStatus(profile) {
  const status = profile?.member_status ?? 'Good';
  const expires = profile?.member_expires;
  if (!expires || status === 'Good') return status;
  const ts = Math.floor(new Date(expires).getTime() / 1000);
  return `${status}: <t:${ts}:R>`;
}

export function buildMemberInfoEmbed(member, profile) {
  const user = member.user;
  const status = profile?.member_status ?? 'Good';
  const level = profile?.member_level ?? profile?.level ?? 0;
  const statusText = formatMemberStatus(profile);
  const joinDiscord = user.createdAt
    ? user.createdAt.toLocaleString('vi-VN')
    : 'N/A';
  const joinServer = member.joinedAt
    ? member.joinedAt.toLocaleString('vi-VN')
    : 'N/A';
  const highestRole =
    member.roles?.highest && member.roles.highest.id !== member.guild.id
      ? member.roles.highest.toString()
      : 'None';

  const embed = new EmbedBuilder()
    .setColor(MEMBER_INFO_COLOR)
    .setTitle(`✦ ${user.username}`)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: 'UID', value: user.id, inline: true },
      { name: 'Name', value: member.displayName, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Join Discord', value: joinDiscord, inline: true },
      { name: 'Join Server', value: joinServer, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Level', value: String(level), inline: true },
      { name: 'Status', value: statusText, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Role', value: highestRole, inline: false }
    )
    .setTimestamp();

  if (mainImageURL) embed.setImage(mainImageURL);
  return embed;
}
