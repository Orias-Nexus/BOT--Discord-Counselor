/**
 * Cấu trúc embed chuẩn (Discord API): dùng trực tiếp channel.send({ embeds: [data] }).
 * Các trường: title, description, url, color, timestamp, author, thumbnail, image, fields, footer.
 */

/**
 * Thay thế placeholder {key} trong chuỗi bằng vars[key].
 * @param {string} str
 * @param {Record<string, string|number>} vars
 * @returns {string}
 */
export function replaceInString(str, vars) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{([^}]+)\}/g, (_, key) => {
    const v = vars[key];
    return v !== undefined && v !== null ? String(v) : `{${key}}`;
  });
}

/**
 * Đệ quy thay thế placeholder trong mọi chuỗi của object (embed data).
 * @param {object} obj
 * @param {Record<string, string|number>} vars
 * @returns {object}
 */
export function replacePlaceholders(obj, vars) {
  if (!obj || typeof vars !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      out[k] = replaceInString(v, vars);
    } else if (v && typeof v === 'object' && !(v instanceof Date)) {
      out[k] = replacePlaceholders(v, vars);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Loại bỏ key có giá trị null/undefined trong object (đệ quy 1 cấp cho author, thumbnail, image, footer).
 * Giúp embed data không gửi null lên Discord API.
 * @param {object} obj
 * @returns {object}
 */
export function omitNull(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (v && typeof v === 'object' && !Array.isArray(v) && (k === 'author' || k === 'thumbnail' || k === 'image' || k === 'footer')) {
      const sub = omitNull(v);
      if (Object.keys(sub).length > 0) out[k] = sub;
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Màu embed (integer, decimal).
 */
export const EMBED_COLORS = {
  DEFAULT: 5763719,
  SERVER_INFO: 0xfcfcfc,
  CATEGORY_INFO: 0xfdfcfa,
  CHANNEL_INFO: 0xfbfcf8,
  MEMBER_INFO: 0xf5f5f5,
  STATUS: {
    Newbie: 0x5865f2,
    Good: 0x57f287,
    Warn: 0xfee75c,
    Warning: 0xfee75c,
    Mute: 0xed4245,
    Lock: 0x992d22,
    Locked: 0x992d22,
    Leaved: 0x747f8d,
  },
};
