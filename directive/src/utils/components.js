import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export const ACTION_PREFIX = 'action_';

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
  GreetingMessage:  'Greeting Message',
  LeavingMessage:   'Leaving Message',
  BoostingMessage:  'Boosting Message',
  EmbedEditAuthor:  'Author',
  EmbedEditFooter:  'Footer',
  EmbedEditImages:  'Images',
  EmbedEditBasic:   'Basic Info',
  EmbedRename:      'Rename',
  EmbedApply:       'Apply',
  EmbedDelete:      'Delete',
};

const SERVER_ACTIONS_ROW1 = ['StatusRole', 'StatusUnrole', 'StatusTimeout'];
const SERVER_ACTIONS_ROW2 = ['SetServerStats', 'SetVoiceCreator'];
const CATEGORY_BASE_ACTIONS = ['CategoryClone'];
const MEMBER_ACTIONS_ROW1 = ['MemberRename', 'MemberSetlevel', 'MemberMove', 'MemberReset'];
const MEMBER_ACTIONS_ROW2 = ['MemberWarn', 'MemberMute', 'MemberLock', 'MemberKick'];

const STYLE = {
  Default: ButtonStyle.Secondary,
  Primary: ButtonStyle.Primary,
  Success: ButtonStyle.Success,
  Danger:  ButtonStyle.Danger,
};

const SCRIPT_STYLE = {
  MemberReset: STYLE.Success,
  MemberKick:  STYLE.Danger,
  EmbedApply:  STYLE.Primary,
  EmbedDelete: STYLE.Danger,
};

/**
 * Tạo một ActionRow từ danh sách script names.
 * Style tự động tra cứu SCRIPT_STYLE, có thể override qua options.
 * @param {string[]} scriptNames
 * @param {string} contextId
 * @param {{ styles?: Record<string, ButtonStyle>, labels?: Record<string, string> }} options
 * @returns {ActionRowBuilder}
 */
function buildActionRow(scriptNames, contextId, { styles = {}, labels = {} } = {}) {
  return new ActionRowBuilder().addComponents(
    scriptNames.map((name) =>
      new ButtonBuilder()
        .setCustomId(`${ACTION_PREFIX}${name}_${contextId}`)
        .setLabel(String(labels[name] ?? SCRIPT_TO_LABEL[name] ?? name).slice(0, 80))
        .setStyle(styles[name] ?? SCRIPT_STYLE[name] ?? STYLE.Default)
    )
  );
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
  return [
    buildActionRow(SERVER_ACTIONS_ROW1, 'server'),
    buildActionRow(SERVER_ACTIONS_ROW2, 'server'),
  ];
}

/** @returns {ActionRowBuilder[]} */
export function buildCategoryInfoComponents(categoryId, category = null, guild = null) {
  const toggleScript = isPublicChannel(category, guild) ? 'CategoryPrivate' : 'CategoryPublic';
  return [buildActionRow([...CATEGORY_BASE_ACTIONS, toggleScript], categoryId)];
}

/** @returns {ActionRowBuilder[]} */
export function buildChannelInfoComponents(channelId, channel = null, guild = null) {
  const toggleScript = isPublicChannel(channel, guild) ? 'ChannelPrivate' : 'ChannelPublic';
  const nsfwScript = channel?.nsfw ? 'ChannelSFW' : 'ChannelNSFW';
  return [buildActionRow(['ChannelClone', toggleScript, 'ChannelSync', nsfwScript], channelId)];
}

/** @returns {ActionRowBuilder[]} */
export function buildMemberInfoComponents(memberId, profile = null) {
  const labels = { MemberReset: getMemberResetLabel(profile?.member_status) };
  return [
    buildActionRow(MEMBER_ACTIONS_ROW1, memberId, { labels }),
    buildActionRow(MEMBER_ACTIONS_ROW2, memberId),
  ];
}

/** @returns {ActionRowBuilder[]} */
export function buildEmbedEditComponents(embedId) {
  return [
    buildActionRow(['EmbedEditAuthor', 'EmbedEditFooter', 'EmbedEditImages', 'EmbedEditBasic'], embedId),
    buildActionRow(['EmbedRename', 'EmbedApply', 'EmbedDelete'], embedId),
  ];
}
