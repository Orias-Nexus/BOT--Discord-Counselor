/**
 * Guards (Phase 1): denyuser, denyperm, denychannel, denyrole, denyitem.
 * Return false to halt pipeline.
 */

function getMember(ctx) {
  return ctx.meta?.member ?? null;
}

function getUserId(ctx) {
  return ctx.meta?.user?.id ?? ctx.message?.author?.id ?? ctx.interaction?.user?.id ?? '';
}

function getChannelId(ctx) {
  const ch = ctx.meta?.channel ?? ctx.message?.channel ?? ctx.interaction?.channel;
  return ch?.id ?? '';
}

export function denyuser(ctx, argument) {
  if (!argument?.trim()) return true;
  const denied = argument.trim().split(',').map((s) => s.trim());
  const id = getUserId(ctx);
  return !denied.includes(id);
}

export function denyperm(ctx, argument) {
  if (!argument?.trim()) return true;
  const member = getMember(ctx);
  if (!member?.permissions?.has) return true;
  return !member.permissions.has(argument.trim());
}

export function denychannel(ctx, argument) {
  if (!argument?.trim()) return true;
  const denied = argument.trim().split(',').map((s) => s.trim());
  const id = getChannelId(ctx);
  return !denied.includes(id);
}

export function denyrole(ctx, argument) {
  if (!argument?.trim()) return true;
  const member = getMember(ctx);
  if (!member?.roles?.cache) return true;
  const denied = argument.trim().split(',').map((s) => s.trim());
  const hasAny = denied.some((roleId) => member.roles.cache.has(roleId));
  return !hasAny;
}

export function denyitem(ctx, argument) {
  if (!argument?.trim()) return true;
  const has = ctx.meta?.hasUserItem?.(ctx, argument.trim()) ?? ctx.hasUserItem?.(ctx, argument.trim());
  return !has;
}
