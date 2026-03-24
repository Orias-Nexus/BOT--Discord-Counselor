/**
 * Placeholders: message_link, message_id, message_content.
 */

export function message_link(ctx, argument) {
  const msg = ctx.message ?? null;
  if (!msg?.url) return '';
  return msg.url;
}

export function message_id(ctx, argument) {
  const msg = ctx.message ?? null;
  return msg?.id ?? '';
}

export function message_content(ctx, argument) {
  const msg = ctx.message ?? null;
  return msg?.content ?? '';
}
