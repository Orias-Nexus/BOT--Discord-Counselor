/**
 * Action (Phase 3): setnick. Push task to ctx.actionQueue.
 */

export function setnick(ctx, argument) {
  const nick = argument != null ? String(argument).trim() : '';
  ctx.actionQueue.push({ type: 'setnick', argument: nick, fullMatch: `{setnick: ${argument}}` });
}
