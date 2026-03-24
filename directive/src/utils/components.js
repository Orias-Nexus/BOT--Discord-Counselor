import { ActionRowBuilder, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } from 'discord.js';

export const ACTION_PREFIX = 'action_';
export const ACTION_SELECT_PREFIX = 'actionsel_';

export const SCRIPT_TO_LABEL = {
  StatusTimeout:    'Status Timeout',
  StatusRole:       'Status Roles',
  StatusUnrole:     'Status Unrole',
  SetVoiceCreator:  'Voice Creator',
  SetServerStats:   'Server Stats',
  CategoryClone:    'Clone',
  CategoryPrivate:  'Private',
  CategoryPublic:   'Public',
  ChannelClone:     'Clone',
  ChannelPrivate:   'Private',
  ChannelPublic:    'Public',
  ChannelSync:      'Sync',
  ChannelNSFW:      'NSFW',
  ChannelSFW:       'SFW',
  ChannelSlow:      'Slow',
  ChannelUnslow:    'Unslow',
  ChannelBitrate:   'Bitrate',
  ChannelLimit:     'Limit',
  MemberRename:     'Name',
  MemberSetlevel:   'Level',
  MemberMove:       'Move',
  MemberReset:      'Good',
  MemberWarn:       'Warn',
  MemberMute:       'Mute',
  MemberLock:       'Lock',
  MemberKick:       'Kick',
  GreetingChannel:  'Greeting Channel',
  LeavingChannel:   'Leaving Channel',
  BoostingChannel:  'Boosting Channel',
  LevelingChannel:  'Leveling Channel',
  LoggingChannel:   'Logging Channel',
  GreetingMessage:  'Greeting Message',
  LeavingMessage:   'Leaving Message',
  BoostingMessage:  'Boosting Message',
  LevelingMessage:  'Leveling Message',
  LoggingMessage:   'Logging Message',
  EmbedEditAuthor:  'Author',
  EmbedEditFooter:  'Footer',
  EmbedEditImages:  'Images',
  EmbedEditBasic:   'Basic Info',
  EmbedRename:      'Rename',
  EmbedApply:       'Apply',
  EmbedDelete:      'Delete',
};

const SERVER_ACTIONS = ['StatusRole', 'StatusUnrole', 'StatusTimeout', 'SetServerStats', 'SetVoiceCreator'];
const CATEGORY_BASE_ACTIONS = ['CategoryClone'];
const MEMBER_ACTIONS = ['MemberRename', 'MemberSetlevel', 'MemberMove', 'MemberReset', 'MemberWarn', 'MemberMute', 'MemberLock', 'MemberKick'];

function buildSelectRow(scriptNames, contextId, { labels = {}, placeholder = 'Choose an action' } = {}) {
  const select = new StringSelectMenuBuilder()
    .setCustomId(`${ACTION_SELECT_PREFIX}${contextId}`)
    .setPlaceholder(placeholder)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      scriptNames.map((name) => ({
        label: String(labels[name] ?? SCRIPT_TO_LABEL[name] ?? name).slice(0, 100),
        value: name,
      }))
    );
  return new ActionRowBuilder().addComponents(select);
}

function isPublicChannel(channel, guild) {
  if (!channel || !guild) return true;
  const overwrite = channel.permissionOverwrites?.cache?.get(guild.id);
  return !overwrite || !overwrite.deny?.has(PermissionFlagsBits.ViewChannel);
}

function getMemberResetLabel(memberStatus) {
  switch (memberStatus) {
    case 'Warning': return 'Unwarn';
    case 'Muted':   return 'Unmute';
    case 'Locked':  return 'Unlock';
    default:        return 'Good';
  }
}

/** @returns {ActionRowBuilder[]} */
export function buildServerInfoComponents() {
  return [buildSelectRow(SERVER_ACTIONS, 'server', { placeholder: 'Server actions' })];
}

/** @returns {ActionRowBuilder[]} */
export function buildCategoryInfoComponents(categoryId, category = null, guild = null) {
  const toggleScript = isPublicChannel(category, guild) ? 'CategoryPrivate' : 'CategoryPublic';
  return [buildSelectRow([...CATEGORY_BASE_ACTIONS, toggleScript], categoryId, { placeholder: 'Category actions' })];
}

/** @returns {ActionRowBuilder[]} */
export function buildChannelInfoComponents(channelId, channel = null, guild = null) {
  const toggleScript = isPublicChannel(channel, guild) ? 'ChannelPrivate' : 'ChannelPublic';
  const nsfwScript = channel?.nsfw ? 'ChannelSFW' : 'ChannelNSFW';
  const slowScript = channel?.rateLimitPerUser ? 'ChannelUnslow' : 'ChannelSlow';
  const scripts = ['ChannelClone', 'ChannelSync', toggleScript, nsfwScript, slowScript];

  const isVoice = channel?.type === ChannelType.GuildVoice || channel?.type === ChannelType.GuildStageVoice;
  if (isVoice) scripts.push('ChannelBitrate', 'ChannelLimit');

  return [buildSelectRow(scripts, channelId, { placeholder: 'Channel actions' })];
}

/** @returns {ActionRowBuilder[]} */
export function buildMemberInfoComponents(memberId, profile = null) {
  const labels = { MemberReset: getMemberResetLabel(profile?.member_status) };
  return [buildSelectRow(MEMBER_ACTIONS, memberId, { labels, placeholder: 'Member actions' })];
}

/** @returns {ActionRowBuilder[]} */
export function buildEmbedEditComponents(embedId) {
  return [
    buildSelectRow(
      ['EmbedEditAuthor', 'EmbedEditFooter', 'EmbedEditImages', 'EmbedEditBasic', 'EmbedRename', 'EmbedApply', 'EmbedDelete'],
      embedId,
      { placeholder: 'Embed actions' }
    ),
  ];
}
