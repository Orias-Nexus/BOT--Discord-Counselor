/**
 * Advanced logic: {lockedchoose: a;b;c} và [lockedchoice]. Chọn ngẫu nhiên nhưng cố định theo user (hash user_id).
 */

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function pickLocked(userId, argument) {
  if (!argument || typeof argument !== 'string') return '';
  const items = argument.split(';').map((s) => s.trim()).filter(Boolean);
  if (items.length === 0) return '';
  const idx = hash(userId) % items.length;
  return items[idx];
}

export function lockedchoose(ctx, argument) {
  const userId = ctx.meta?.user?.id ?? ctx.message?.author?.id ?? ctx.interaction?.user?.id ?? '';
  const result = pickLocked(userId, argument);
  if (!ctx.placeholderCache) ctx.placeholderCache = {};
  ctx.placeholderCache.lockedchoice = result;
  return result;
}

export function lockedchoice(ctx, argument, tagName) {
  return ctx.placeholderCache?.lockedchoice ?? '';
}
