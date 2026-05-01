/**
 * Discord ChannelType mapping — mirrors discord.js ChannelType enum values.
 * Used to show appropriate icons next to channel names across the dashboard.
 */

// discord.js ChannelType enum values
const CHANNEL_TYPE = {
  GUILD_TEXT: 0,
  DM: 1,
  GUILD_VOICE: 2,
  GROUP_DM: 3,
  GUILD_CATEGORY: 4,
  GUILD_ANNOUNCEMENT: 5,
  GUILD_STAGE_VOICE: 13,
  GUILD_FORUM: 15,
  GUILD_MEDIA: 16,
};

/**
 * Returns a Font Awesome icon class string matching the Discord channel type.
 * Uses FA6 Pro icons to closely mirror Discord's native channel icons.
 */
export function getChannelIcon(type) {
  switch (type) {
    case CHANNEL_TYPE.GUILD_TEXT:
      return 'fa-solid fa-hashtag';
    case CHANNEL_TYPE.GUILD_VOICE:
      return 'fa-solid fa-volume-high';
    case CHANNEL_TYPE.GUILD_CATEGORY:
      return 'fa-solid fa-folder';
    case CHANNEL_TYPE.GUILD_ANNOUNCEMENT:
      return 'fa-solid fa-bullhorn';
    case CHANNEL_TYPE.GUILD_STAGE_VOICE:
      return 'fa-solid fa-podcast';
    case CHANNEL_TYPE.GUILD_FORUM:
      return 'fa-solid fa-comments';
    case CHANNEL_TYPE.GUILD_MEDIA:
      return 'fa-solid fa-photo-film';
    default:
      return 'fa-solid fa-hashtag';
  }
}

/**
 * Returns a human-readable label for the channel type.
 */
export function getChannelTypeLabel(type) {
  switch (type) {
    case CHANNEL_TYPE.GUILD_TEXT:        return 'Text';
    case CHANNEL_TYPE.GUILD_VOICE:      return 'Voice';
    case CHANNEL_TYPE.GUILD_CATEGORY:   return 'Category';
    case CHANNEL_TYPE.GUILD_ANNOUNCEMENT: return 'Announcement';
    case CHANNEL_TYPE.GUILD_STAGE_VOICE: return 'Stage';
    case CHANNEL_TYPE.GUILD_FORUM:      return 'Forum';
    case CHANNEL_TYPE.GUILD_MEDIA:      return 'Media';
    default:                            return 'Channel';
  }
}

export { CHANNEL_TYPE };
