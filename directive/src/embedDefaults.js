/**
 * Embed mặc định của từng script (hardcode). Không gọi database khi chạy lệnh/action.
 * Bảng embeds trong DB chỉ còn embed do người dùng tạo (messages, v.v.).
 */

/** script -> { replyType, content?, builder? } */
export const EMBED_BY_SCRIPT = {
  ServerInfo: { replyType: 'embed', builder: 'serverInfoEmbed.buildEmbed' },
  StatusTimeout: { replyType: 'ephemeral', content: 'Updated Status Timeout: - Warn: {time_warn} - Mute: {time_mute} - Lock: {time_lock} - Newbie: {time_new}.' },
  StatusRole: { replyType: 'ephemeral', content: 'Updated Status Role: - Warn: {role_warn} - Mute: {role_mute} - Lock: {role_lock} - Newbie: {role_new}.' },
  StatusUnrole: { replyType: 'ephemeral', content: 'Updated Status Unrole: - Mute: {unrole_mute} - Lock: {unrole_lock}.' },
  SetVoiceCreator: { replyType: 'ephemeral', content: 'Created category and voice channel. Members joining will get their own private channel.' },
  SetServerStats: { replyType: 'ephemeral', content: 'Select stats to display. Channels will update every minute.' },
  CategoryInfo: { replyType: 'embed', builder: 'categoryInfoEmbed.buildCategoryEmbed' },
  CategoryClone: { replyType: 'ephemeral', content: 'Completed Clone {Category Name}.' },
  CategoryPrivate: { replyType: 'ephemeral', content: 'Privated {Category Name}.' },
  CategoryPublic: { replyType: 'ephemeral', content: 'Published {Category Name}.' },
  ChanelInfo: { replyType: 'embed', builder: 'channelInfoEmbed.buildChannelEmbed' },
  ChannelClone: { replyType: 'ephemeral', content: 'Completed Clone {Channel Name}.' },
  ChannelCreate: { replyType: 'ephemeral', content: '' },
  ChannelSync: { replyType: 'ephemeral', content: 'Completed Sync {Channel Name}.' },
  ChannelPrivate: { replyType: 'ephemeral', content: 'Privated {Channel Name}.' },
  ChannelPublic: { replyType: 'ephemeral', content: 'Published {Channel Name}.' },
  ChannelSFW: { replyType: 'ephemeral', content: 'Changed channel {Channel Name} to SFW.' },
  ChannelNSFW: { replyType: 'ephemeral', content: 'Changed channel {Channel Name} to NSFW.' },
  MemberInfo: { replyType: 'embed', builder: 'memberInfoEmbed.buildEmbed' },
  MemberRename: { replyType: 'ephemeral', content: 'Completed Rename {Username} to {Server Profile Name}.' },
  MemberSetlevel: { replyType: 'ephemeral', content: 'Completed Set Level {Server Profile Name}: {member_level}.' },
  MemberMove: { replyType: 'ephemeral', content: 'Moved {Number of Member} to {Channel Name}.' },
  MemberReset: { replyType: 'ephemeral', content: "{Server Profile Name}'s Status is Good now." },
  MemberWarn: { replyType: 'ephemeral', content: "{Server Profile Name}'s Status is Warning until {Member Expires}." },
  MemberMute: { replyType: 'ephemeral', content: "{Server Profile Name}'s Status is Muted until {Member Expires}." },
  MemberLock: { replyType: 'ephemeral', content: "{Server Profile Name}'s Status is Locked until {Member Expires}." },
  MemberKick: { replyType: 'ephemeral', content: "{Server Profile Name} has been Kicked." },
  MemberGreeting: { replyType: 'ephemeral', content: '' },
  MemberLeaving: { replyType: 'ephemeral', content: '' },
};

/**
 * Lấy nội dung content của embed theo script (không gọi API).
 * @param {string} scriptName
 * @returns {string|undefined}
 */
export function getEmbedContent(scriptName) {
  return EMBED_BY_SCRIPT[scriptName]?.content;
}
