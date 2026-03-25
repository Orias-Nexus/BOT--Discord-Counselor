/**
 * Placeholders: user*, user_tag, user_name, user_avatar, user_discrim, user_id, user_nick,
 * user_joindate, user_createdate, user_displaycolor, user_boostsince,
 * user_balance, user_balance_locale, user_item, user_item_count, user_inventory.
 * Các trường economy/inventory cần inject (getUserBalance, getUserInventory) qua context hoặc API.
 */

function getUser(ctx) {
  return ctx.meta?.user ?? ctx.message?.author ?? ctx.interaction?.user ?? null;
}

function getMember(ctx) {
  return ctx.meta?.member ?? null;
}

export function user(ctx, argument) {
  const u = getUser(ctx);
  return u ? `<@${u.id}>` : '{user}';
}

export function user_tag(ctx, argument) {
  const u = getUser(ctx);
  if (!u) return '';
  return u.tag ?? `${u.username}#${u.discriminator ?? '0'}`;
}

export function user_name(ctx, argument) {
  const member = getMember(ctx);
  const u = getUser(ctx);
  if (!u) return '';
  if (member?.displayName) return member.displayName;
  return u.username ?? u.globalName ?? '';
}

export function user_avatar(ctx, argument) {
  const u = getUser(ctx);
  if (!u) return '';
  try {
    return u.displayAvatarURL({ size: 256 }) ?? '';
  } catch {
    return '';
  }
}

export function user_discrim(ctx, argument) {
  const u = getUser(ctx);
  if (!u) return '';
  return u.discriminator ?? '0';
}

export function user_id(ctx, argument) {
  const u = getUser(ctx);
  return u ? u.id : '';
}

export function user_nick(ctx, argument) {
  const member = getMember(ctx);
  if (!member?.displayName) return '';
  return member.displayName;
}

export function user_joindate(ctx, argument) {
  const member = getMember(ctx);
  if (!member?.joinedAt) return '';
  return member.joinedAt.toLocaleString('vi-VN');
}

export function user_createdate(ctx, argument) {
  const u = getUser(ctx);
  if (!u?.createdAt) return '';
  return u.createdAt.toLocaleString('vi-VN');
}

export function user_displaycolor(ctx, argument) {
  const member = getMember(ctx);
  if (!member?.displayColor) return '0';
  return String(member.displayColor);
}

export function user_boostsince(ctx, argument) {
  const member = getMember(ctx);
  const since = member?.premiumSince ?? null;
  if (!since) return '';
  return since.toLocaleString('vi-VN');
}

export function user_balance(ctx, argument) {
  const bal = ctx.meta?.getUserBalance?.(ctx) ?? ctx.getUserBalance?.(ctx);
  if (typeof bal === 'number') return String(bal);
  return '0';
}

export function user_balance_locale(ctx, argument) {
  const bal = ctx.meta?.getUserBalance?.(ctx) ?? ctx.getUserBalance?.(ctx);
  if (typeof bal === 'number') return bal.toLocaleString('vi-VN');
  return '0';
}

export function user_item(ctx, argument) {
  const item = ctx.meta?.getUserItem?.(ctx) ?? ctx.getUserItem?.(ctx);
  return typeof item === 'string' ? item : '';
}

export function user_item_count(ctx, argument) {
  const count = ctx.meta?.getUserItemCount?.(ctx) ?? ctx.getUserItemCount?.(ctx);
  return typeof count === 'number' ? String(count) : '0';
}

export function user_inventory(ctx, argument) {
  const list = ctx.meta?.getUserInventory?.(ctx) ?? ctx.getUserInventory?.(ctx);
  if (Array.isArray(list)) return list.join(', ');
  return typeof list === 'string' ? list : '';
}

export function user_exp(ctx) {
  const exp = ctx.meta?.userProfile?.user_exp ?? 0;
  return Number(exp).toLocaleString('en-US');
}

export function user_rank(ctx) {
  const rank = ctx.meta?.userRank ?? '?';
  return `#${rank}`;
}
