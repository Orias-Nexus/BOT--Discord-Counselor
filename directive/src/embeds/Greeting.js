import { replacePlaceholders, omitNull, EMBED_COLORS } from './schema.js';

/** Template embed chào mừng (đầy đủ cấu trúc). Placeholder: server_name, user, user_id, member_count, role_channel_id, role_mention, v.v. */
const GREETING_TEMPLATE = {
  title: '🎉 Chào mừng đến với {server_name}!',
  description:
    'Xin chào {user}, cảm ơn bạn đã tham gia cộng đồng của chúng tôi. Hãy lấy role tại <#{role_channel_id}> và bắt đầu trò chuyện nhé!',
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
  fields: [
    { name: '👑 Thành viên thứ:', value: '{member_count}', inline: true },
    { name: '📜 Vai trò cấp phát:', value: '{role_mention}', inline: true },
    {
      name: '⚠️ Lưu ý quan trọng',
      value: 'Vui lòng tuân thủ mọi quy định của server. Mọi hành vi spam sẽ bị xử lý nghiêm ngặt.',
      inline: false,
    },
  ],
  footer: {
    text: 'Hệ thống tự động • ID: {user_id}',
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
