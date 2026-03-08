import { replacePlaceholders, omitNull, EMBED_COLORS } from './schema.js';

/** Template embed tạm biệt. Placeholder: server_name, user, user_id, member_count. */
const LEAVING_TEMPLATE = {
  title: '👋 Tạm biệt {user}',
  description: '{user} đã rời khỏi **{server_name}**. Hiện tại server có **{member_count}** thành viên.',
  url: null,
  color: EMBED_COLORS.DEFAULT,
  timestamp: new Date().toISOString(),
  author: {
    name: 'Hệ thống Quản lý Server',
    url: null,
    icon_url: null,
  },
  thumbnail: { url: null },
  image: { url: null },
  fields: [],
  footer: {
    text: 'ID: {user_id}',
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
