import { replacePlaceholders, omitNull, EMBED_COLORS } from './schema.js';

/** Template embed chào mừng (đầy đủ cấu trúc). Placeholder: server_name, user, user_id, member_count, role_channel_id, role_mention, v.v. */
const GREETING_TEMPLATE = {
  title: 'Xin chào {user_name}! UwU 💕',
  description: '{user}\n\n**Chào mừng đến với Orias Nexú ✨**\n\nGhé qua đây để hiểu hơn về chúng tôi: <#1399818172017807572>\n\n✨ **Chúc bạn có những phút giây vui vẻ tại Orias Nexus !**',
  color: EMBED_COLORS.STATUS.Newbie,
  timestamp: new Date().toISOString(),
  author: {
    name: null,
    icon_url: null,
  },
  thumbnail: { url: '{user_avatar}' },
  image: { url: 'https://github.com/Orias1701/Resources--Discord-Bots/blob/main/assets/img/Nahihi.png?raw=true' },
  fields: [],
  footer: {
    text: '✨ Greeting...',
    icon_url: null,
  },
};

/**
 * Trả về embed data chào mừng (đã thay placeholder). Có thể gửi: channel.send({ embeds: [data] }).
 * @param {Record<string, string|number>} vars - server_name, user, user_id, member_count, role_channel_id, role_mention
 * @returns {object} Embed data (plain object)
 */
export function getGreetingEmbed(vars = {}) {
  const withTimestamp = {
    ...GREETING_TEMPLATE,
    timestamp: (vars.timestamp && new Date(vars.timestamp).toISOString()) || new Date().toISOString(),
  };
  return omitNull(replacePlaceholders(withTimestamp, vars));
}
