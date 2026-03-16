/**
 * Actions (Phase 3): react, reactreply. Push task to ctx.actionQueue.
 */

export function react(ctx, argument) {
  if (!argument?.trim()) return;
  ctx.actionQueue.push({ type: 'react', argument: argument.trim(), fullMatch: `{react: ${argument}}` });
}

export function reactreply(ctx, argument) {
  if (!argument?.trim()) return;
  ctx.actionQueue.push({ type: 'reactreply', argument: argument.trim(), fullMatch: `{reactreply: ${argument}}` });
}
