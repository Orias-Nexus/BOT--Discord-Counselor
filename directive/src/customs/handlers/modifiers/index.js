/**
 * Modifiers (Phase 2): dm, sendto, embed, silent, delete, delete_reply.
 * Mutate ctx (routing flags).
 */

export function dm(ctx, argument) {
  ctx.isDM = true;
}

export function sendto(ctx, argument) {
  if (argument?.trim()) ctx.targetChannelId = argument.trim();
}

export function embed(ctx, argument) {
  if (argument?.trim()) ctx.embedId = argument.trim();
}

export function silent(ctx, argument) {
  ctx.silent = true;
}

export function deleteTag(ctx, argument) {
  ctx.deleteCommand = true;
}

export function delete_reply(ctx, argument) {
  const sec = parseInt(argument?.trim(), 10);
  if (!Number.isNaN(sec) && sec >= 0) ctx.deleteReplyAfter = sec;
}
