/**
 * Actions (Phase 3): addbutton, addlinkbutton. Push task to ctx.actionQueue.
 */

export function addbutton(ctx, argument) {
  if (!argument?.trim()) return;
  ctx.actionQueue.push({ type: 'addbutton', argument: argument.trim(), fullMatch: `{addbutton: ${argument}}` });
}

export function addlinkbutton(ctx, argument) {
  if (!argument?.trim()) return;
  ctx.actionQueue.push({ type: 'addlinkbutton', argument: argument.trim(), fullMatch: `{addlinkbutton: ${argument}}` });
}
