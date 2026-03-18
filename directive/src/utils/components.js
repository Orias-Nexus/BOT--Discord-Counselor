import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

/** Map script name to action label (Architecture Action items). */
export const SCRIPT_TO_LABEL = {
  StatusTimeout: 'Status Timeout',
  StatusRole: 'Status Role',
  StatusUnrole: 'Status Unrole',
  CategoryClone: 'Clone',
  CategoryPrivate: 'Private',
  CategoryPublic: 'Public',
  ChannelClone: 'Clone',
  ChannelSync: 'Sync',
  ChannelPrivate: 'Private',
  ChannelPublic: 'Public',
  ChannelSFW: 'SFW',
  ChannelNSFW: 'NSFW',
  MemberRename: 'Name',
  MemberSetlevel: 'Level',
  MemberMove: 'Move',
  MemberReset: 'Good',
  MemberWarn: 'Warn',
  MemberMute: 'Mute',
  MemberLock: 'Lock',
  MemberKick: 'Kick',
  SetVoiceCreator: 'Voice Creator',
  SetServerStats: 'Server Stats',
  GreetingChannel: 'Greeting Channel',
  LeavingChannel: 'Leaving Channel',
  BoostingChannel: 'Boosting Channel',
  GreetingMessage: 'Greeting Message',
  LeavingMessage: 'Leaving Message',
  BoostingMessage: 'Boosting Message',
};

/** Actions included per parent (Architecture Slash actions_included). */
const SERVER_INFO_ACTIONS = ['StatusTimeout', 'StatusRole', 'StatusUnrole'];
const SERVER_INFO_ACTIONS_ROW2 = ['SetVoiceCreator', 'SetServerStats'];
const CATEGORY_INFO_ACTIONS_BASE = ['CategoryClone'];
const CHANNEL_INFO_ACTIONS = ['ChannelClone', 'ChannelSync', 'ChannelPrivate', 'ChannelPublic', 'ChannelSFW', 'ChannelNSFW'];
/** Max 5 buttons per ActionRow (Discord limit). Split 8 actions into 2 rows. */
const MEMBER_INFO_ACTIONS_ROW1 = ['MemberRename', 'MemberSetlevel', 'MemberMove', 'MemberReset'];
const MEMBER_INFO_ACTIONS_ROW2 = ['MemberWarn', 'MemberMute', 'MemberLock', 'MemberKick'];

const PREFIX = 'action_';
/** Default style for buttons without explicit color (same as channel Sync button). */
const DEFAULT_BUTTON_STYLE = ButtonStyle.Secondary;
const STYLE_MAP = { Default: ButtonStyle.Primary, Green: ButtonStyle.Success, Red: ButtonStyle.Danger };

function buildActionRow(scriptNames, contextId, styleOverrides = {}, labelOverrides = {}) {
  const row = new ActionRowBuilder();
  for (const scriptName of scriptNames) {
    const label = labelOverrides[scriptName] ?? SCRIPT_TO_LABEL[scriptName] ?? scriptName;
    const style = styleOverrides[scriptName] ?? DEFAULT_BUTTON_STYLE;
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${PREFIX}${scriptName}_${contextId}`)
        .setLabel(String(label).slice(0, 80))
        .setStyle(style)
    );
  }
  return row;
}

/** Good button label by member status (Good / Warning / Muted / Locked). */
function getMemberResetLabel(memberStatus) {
  switch (memberStatus) {
    case 'Warning': return 'Unwarn';
    case 'Muted': return 'Unmute';
    case 'Locked': return 'Unlock';
    default: return 'Good';
  }
}

export function buildServerInfoComponents() {
  const row = buildActionRow(SERVER_INFO_ACTIONS, 'server');
  const row2 = buildActionRow(SERVER_INFO_ACTIONS_ROW2, 'server');
  return { row, row2 };
}

export function buildCategoryInfoComponents(categoryId, category, guild) {
  const scripts = [...CATEGORY_INFO_ACTIONS_BASE];
  if (category && guild) {
    const overwrite = category.permissionOverwrites?.cache?.get(guild.id);
    const isPublic = !overwrite || !overwrite.deny?.has(PermissionFlagsBits.ViewChannel);
    scripts.push(isPublic ? 'CategoryPrivate' : 'CategoryPublic');
  } else {
    scripts.push('CategoryPrivate', 'CategoryPublic');
  }
  const row = buildActionRow(scripts, categoryId);
  return { row };
}

export function buildChannelInfoComponents(channelId, channel, guild) {
  const overwrite = channel.permissionOverwrites?.cache?.get(guild.id);
  const isPublic = !overwrite || !overwrite.deny?.has(PermissionFlagsBits.ViewChannel);
  const status = isPublic ? 'Public' : 'Private';
  const toggleScript = status === 'Public' ? 'ChannelPrivate' : 'ChannelPublic';
  const scripts = ['ChannelClone', toggleScript, 'ChannelSync', channel.nsfw ? 'ChannelSFW' : 'ChannelNSFW'];
  const row = buildActionRow(scripts, channelId);
  return { row };
}

export function buildMemberInfoComponents(memberId, profile = null) {
  const memberStatus = profile?.member_status ?? null;
  const styleOverrides = {
    MemberReset: ButtonStyle.Success,
    MemberKick: ButtonStyle.Danger,
  };
  const labelOverrides = {
    MemberReset: getMemberResetLabel(memberStatus),
  };
  const row1 = buildActionRow(MEMBER_INFO_ACTIONS_ROW1, memberId, styleOverrides, labelOverrides);
  const row2 = buildActionRow(MEMBER_INFO_ACTIONS_ROW2, memberId, styleOverrides, labelOverrides);
  return { row: row1, row2 };
}

export { PREFIX as ACTION_PREFIX };
