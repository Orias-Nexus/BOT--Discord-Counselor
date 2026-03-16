/**
 * Actions (Phase 3): addrole, removerole. Push task to ctx.actionQueue.
 */

export function addrole(ctx, argument) {
  if (!argument?.trim()) return;
  const roleId = argument.trim();
  ctx.actionQueue.push({ type: 'addrole', argument: roleId, fullMatch: `{addrole: ${roleId}}` });
}

export function removerole(ctx, argument) {
  if (!argument?.trim()) return;
  const roleId = argument.trim();
  ctx.actionQueue.push({ type: 'removerole', argument: roleId, fullMatch: `{removerole: ${roleId}}` });
}
