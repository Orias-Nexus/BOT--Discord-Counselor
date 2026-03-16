/**
 * Advanced logic: {choose: a;b;c} và [choice]. Chọn ngẫu nhiên 1 mục; [choice] lấy kết quả đã chọn.
 */

function pickOne(argument) {
  if (!argument || typeof argument !== 'string') return '';
  const items = argument.split(';').map((s) => s.trim()).filter(Boolean);
  if (items.length === 0) return '';
  return items[Math.floor(Math.random() * items.length)];
}

export function choose(ctx, argument) {
  const result = pickOne(argument);
  if (!ctx.placeholderCache) ctx.placeholderCache = {};
  ctx.placeholderCache.choice = result;
  return result;
}

export function choice(ctx, argument, tagName) {
  return ctx.placeholderCache?.choice ?? '';
}
