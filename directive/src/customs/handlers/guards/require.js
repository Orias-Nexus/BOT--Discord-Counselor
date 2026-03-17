/**
 * Guards (Phase 1): requireuser, requireperm, requirechannel, requirerole, requirebal, requireitem, requirearg.
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

export function requireuser(ctx, argument) {
  if (!argument?.trim()) return true;
  const allowed = argument.trim().split(',').map((s) => s.trim());
  const id = getUserId(ctx);
  return allowed.includes(id);
}

export function requireperm(ctx, argument) {
  if (!argument?.trim()) return true;
  const member = getMember(ctx);
  if (!member?.permissions?.has) return false;
  return member.permissions.has(argument.trim());
}

export function requirechannel(ctx, argument) {
  if (!argument?.trim()) return true;
  const allowed = argument.trim().split(',').map((s) => s.trim());
  const id = getChannelId(ctx);
  return allowed.includes(id);
}

export function requirerole(ctx, argument) {
  if (!argument?.trim()) return true;
  const member = getMember(ctx);
  if (!member?.roles?.cache) return false;
  const required = argument.trim().split(',').map((s) => s.trim());
  return required.some((roleId) => member.roles.cache.has(roleId));
}

export function requirebal(ctx, argument) {
  const amount = parseInt(argument?.trim(), 10);
  if (Number.isNaN(amount) || amount < 0) return true;
  const bal = ctx.meta?.getUserBalance?.(ctx) ?? ctx.getUserBalance?.(ctx);
  const current = typeof bal === 'number' ? bal : 0;
  return current >= amount;
}

export function requireitem(ctx, argument) {
  if (!argument?.trim()) return true;
  const has = ctx.meta?.hasUserItem?.(ctx, argument.trim()) ?? ctx.hasUserItem?.(ctx, argument.trim());
  return !!has;
}

export function requirearg(ctx, argument) {
  const args = ctx.userArgs ?? [];
  return args.length > 0 && args.some((a) => a != null && String(a).trim() !== '');
}
