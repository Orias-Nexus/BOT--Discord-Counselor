/**
 * Placeholders: channel, channel_name, channel_createdate, rule_channel
 */

function getChannel(ctx) {
  return ctx.meta?.channel ?? ctx.message?.channel ?? ctx.interaction?.channel ?? null;
}

export function channel(ctx, argument) {
  const ch = getChannel(ctx);
  return ch?.id ? `<#${ch.id}>` : '';
}

export function channel_name(ctx, argument) {
  const ch = getChannel(ctx);
  return ch?.name ?? '';
}

export function channel_createdate(ctx, argument) {
  const ch = getChannel(ctx);
  if (!ch?.createdAt) return '';
  return ch.createdAt.toLocaleString('vi-VN');
}

export function rule_channel(ctx, argument) {
  const guild = ctx.meta?.guild ?? ctx.message?.guild ?? ctx.interaction?.guild ?? null;
  if (!guild) return '';
  const rulesId = guild.rulesChannelId;
  return rulesId ? `<#${rulesId}>` : '';
}