/**
 * Placeholders: date, newline, embed_name.
 */

export function date(ctx, argument) {
  return new Date().toLocaleString('vi-VN');
}

export function newline(ctx, argument) {
  return '\n';
}

export function embed_name(ctx, argument) {
  return ctx.placeholderCache?.embed_name ?? ctx.meta?.embedName ?? '';
}
