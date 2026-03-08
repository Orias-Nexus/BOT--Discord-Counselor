/**
 * Danh sách truy cập nhanh: enum Channel Type (hiển thị / tham chiếu).
 * Không dùng làm khoá DB; DB dùng category_type_enum (Creator | Stats) và channels_idx.
 */
export const CHANNEL_TYPE_LIST = [
  'Creator',
  'Member',
  'Bot',
  'Role',
  'Category',
  'Channel',
  'Boost',
];

/** Category Type enum trong DB: Creator | Stats */
export const CATEGORY_TYPES = ['Creator', 'Stats'];

/**
 * Stat index (1–6) dùng trong channels_idx. 0 = Creator (chỉ dùng cho category Creator).
 * Thứ tự chữ số trong channels_idx = thứ tự kênh trong danh mục.
 */
export const STAT_INDEX = {
  Member: 1,
  Bot: 2,
  Role: 3,
  Category: 4,
  Channel: 5,
  Boost: 6,
};

export const STAT_INDEX_TO_LABEL = {
  1: 'Members',
  2: 'Bots',
  3: 'Roles',
  4: 'Categories',
  5: 'Channels',
  6: 'Boosts',
};

/** Stat index -> tên stat (để format "Members: 0") */
export function getStatLabelByIndex(index) {
  return STAT_INDEX_TO_LABEL[Number(index)] ?? `Stat ${index}`;
}

/**
 * Chuyển channels_idx (số nguyên) thành mảng các stat index (trái → phải = kênh 1 → kênh n).
 * VD: 312 -> [3, 1, 2]
 */
export function digitsFromChannelsIdx(channelsIdx) {
  if (channelsIdx == null || channelsIdx === 0) return [];
  const s = String(channelsIdx).replace(/\D/g, '');
  return s.split('').map((d) => parseInt(d, 10)).filter((n) => n >= 1 && n <= 6);
}

/**
 * Từ mảng stat index [3, 1, 2] tạo channels_idx = 312.
 */
export function channelsIdxFromDigits(digits) {
  if (!Array.isArray(digits) || digits.length === 0) return 0;
  const valid = digits.filter((d) => d >= 1 && d <= 6);
  return parseInt(valid.join(''), 10) || 0;
}
