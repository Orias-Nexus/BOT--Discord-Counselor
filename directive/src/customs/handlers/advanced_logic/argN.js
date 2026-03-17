/**
 * Advanced logic: [$1], [$2], ... ($N bracket syntax). Lấy đối số thứ N người dùng nhập.
 */

export function argN(ctx, argument, tagName) {
  if (!tagName || !/^\$[0-9]+$/.test(tagName)) return tagName ? `[${tagName}]` : '';
  const i = parseInt(tagName.slice(1), 10);
  const val = ctx.userArgs?.[i - 1];
  return val !== undefined && val !== null ? String(val) : '';
}
