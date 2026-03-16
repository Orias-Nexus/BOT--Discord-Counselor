/**
 * Actions (Phase 3): modifybal, modifyinv. Push task to ctx.actionQueue.
 * Thực thi thật cần inject (backend/DB).
 */

export function modifybal(ctx, argument) {
  if (!argument?.trim()) return;
  ctx.actionQueue.push({ type: 'modifybal', argument: argument.trim(), fullMatch: `{modifybal: ${argument}}` });
}

export function modifyinv(ctx, argument) {
  if (!argument?.trim()) return;
  ctx.actionQueue.push({ type: 'modifyinv', argument: argument.trim(), fullMatch: `{modifyinv: ${argument}}` });
}
