/**
 * Placeholders: member_exp, member_level, member_rank.
 * Data injected via ctx.meta.memberProfile and ctx.meta.memberRank.
 */

export function member_exp(ctx) {
  const exp = ctx.meta?.memberProfile?.member_exp ?? 0;
  return Number(exp).toLocaleString('en-US');
}

export function member_level(ctx) {
  return String(ctx.meta?.memberProfile?.member_level ?? 0);
}

export function member_rank(ctx) {
  const rank = ctx.meta?.memberRank ?? '?';
  return `#${rank}`;
}
