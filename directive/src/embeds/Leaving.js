import { replacePlaceholders, omitNull, EMBED_COLORS } from './schema.js';

/** Template embed tạm biệt. Placeholder: server_name, user, user_id, member_count. */
const LEAVING_TEMPLATE = {
  title: '**Impostor Left the Chat ... 🐧**',
  description: '**{user} Đã bay màu khỏi đoạn chat!** ☕\n\n**Xinnn vĩnh biệt cụ!!! 💔✨**',
  color: EMBED_COLORS.STATUS.Leaved,
  timestamp: new Date().toISOString(),
  author: {
    name: null,
    icon_url: null,
  },
  thumbnail: { url: '{user_avatar}' },
  image: { url: 'https://github.com/Orias1701/Resources--Discord-Bots/blob/main/assets/img/Impostor.png?raw=true' },
  fields: [],
  footer: {
    text: '✨ Goodbye...',
    icon_url: null,
  },
};

/**
 * Trả về embed data tạm biệt. channel.send({ embeds: [data] }).
 * @param {Record<string, string|number>} vars - server_name, user, user_id, member_count
 * @returns {object}
 */
export function getLeavingEmbed(vars = {}) {
  const withTimestamp = {
    ...LEAVING_TEMPLATE,
    timestamp: (vars.timestamp && new Date(vars.timestamp).toISOString()) || new Date().toISOString(),
  };
  return omitNull(replacePlaceholders(withTimestamp, vars));
}
