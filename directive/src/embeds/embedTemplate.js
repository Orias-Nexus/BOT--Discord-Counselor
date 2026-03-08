/**
 * Mẫu embed khi người dùng tạo embed (zDraft). Dùng parser để resolve {user_name}, {user_avatar}, ...
 */
import { EMBED_COLORS } from './schema.js';
import { omitNull } from './schema.js';
import { resolveEmbed } from './embedContext.js';

/** Embed mẫu dùng cho /embedcreate. Các chuỗi chứa placeholder sẽ được resolve bằng parser khi hiển thị. */
export const DEFAULT_EMBED_TEMPLATE = {
  title: '**Greeting! {user_name}!**',
  description: '**Welcome to {server_name}!**',
  color: EMBED_COLORS.DEFAULT,
  timestamp: null,
  author: {
    name: '✦ {server_name}',
    icon_url: '{server_icon}',
  },
  thumbnail: { url: '{user_avatar}' },
  image: { url: '{server_banner}' },
  fields: [
    {name: 'Your Position', value: '{server_membercount}', inline: true },
    {name: 'Rule Channel', value: "{rule_channel}", inline: true },
    {name: 'Small Rule', value: 'Just enjoy your time here!', inline: false},
  ],
  footer: {
    text: 'Thank you for joining us!',
    icon_url: '{server_icon}',
  },
};

/**
 * Trả về bản copy mẫu embed (chưa resolve). Dùng khi tạo embed mới.
 * @returns {object}
 */
export function getDefaultEmbedTemplate() {
  return JSON.parse(JSON.stringify(DEFAULT_EMBED_TEMPLATE));
}

/**
 * Trả về embed đã resolve placeholders qua parser (để gửi lên Discord).
 * @param {object} embedData - Embed object (có thể từ DB hoặc template)
 * @param {{ member?: import('discord.js').GuildMember|null, guild?: import('discord.js').Guild|null, channel?: import('discord.js').Channel|null, placeholderCache?: Record<string, string> }} meta
 * @returns {Promise<object>}
 */
export async function getResolvedEmbedForDisplay(embedData, meta = {}) {
  const resolved = await resolveEmbed(embedData ?? getDefaultEmbedTemplate(), meta);
  return omitNull(resolved);
}
