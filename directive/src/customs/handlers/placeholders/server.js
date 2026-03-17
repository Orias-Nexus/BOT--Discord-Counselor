/**
 * Placeholders: server_prefix, server_currency, server_name, server_id, server_icon, server_banner,
 * server_membercount, server_membercount_ordinal, server_membercount_nobots, 
 * server_membercount_nobots_ordinal, server_botcount, server_botcount_ordinal, server_rolecount,
 * server_channelcount, server_randommember, server_randommember_tag, server_randommember_nobots,
 * server_owner, server_owner_id, server_createdate, server_boostlevel, server_boostcount,
 * server_nextboostlevel, server_nextboostlevel_required, server_nextboostlevel_until_required.
 * server_prefix, server_currency cần inject hoặc từ DB.
 */

function getGuild(ctx) {
  return ctx.meta?.guild ?? ctx.message?.guild ?? ctx.interaction?.guild ?? null;
}

function ordinal(n) {
  const s = String(n);
  const last = s.slice(-1);
  if (s.slice(-2) === '11' || s.slice(-2) === '12' || s.slice(-2) === '13') return `${n}th`;
  if (last === '1') return `${n}st`;
  if (last === '2') return `${n}nd`;
  if (last === '3') return `${n}rd`;
  return `${n}th`;
}

export function server_prefix(ctx, argument) {
  const prefix = ctx.meta?.serverPrefix ?? ctx.serverPrefix ?? '/';
  return String(prefix);
}

export function server_currency(ctx, argument) {
  const curr = ctx.meta?.serverCurrency ?? ctx.serverCurrency ?? 'VNĐ';
  return String(curr);
}

export function server_name(ctx, argument) {
  const g = getGuild(ctx);
  return g?.name ?? '';
}

export function server_id(ctx, argument) {
  const g = getGuild(ctx);
  return g?.id ?? '';
}

export function server_icon(ctx, argument) {
  const g = getGuild(ctx);
  if (!g) return '';
  const url = g.iconURL({ size: 256 });
  return url ?? '';
}

export function server_banner(ctx, argument) {
  const g = getGuild(ctx);
  if (!g) return '';
  const url = g.bannerURL({ size: 256 });
  return url ?? '';
}

export function server_membercount(ctx, argument) {
  const g = getGuild(ctx);
  if (!g) return '0';
  const n = g.memberCount ?? g.members?.cache?.size ?? 0;
  return String(n);
}

export function server_membercount_ordinal(ctx, argument) {
  const g = getGuild(ctx);
  if (!g) return '0th';
  const n = g.memberCount ?? g.members?.cache?.size ?? 0;
  return ordinal(n);
}

export function server_membercount_nobots(ctx, argument) {
  const g = getGuild(ctx);
  if (!g?.members?.cache) return '0';
  const n = g.members.cache.filter((m) => !m.user?.bot).size;
  return String(n);
}

export function server_membercount_nobots_ordinal(ctx, argument) {
  const g = getGuild(ctx);
  if (!g?.members?.cache) return '0th';
  const n = g.members.cache.filter((m) => !m.user?.bot).size;
  return ordinal(n);
}

export function server_botcount(ctx, argument) {
  const g = getGuild(ctx);
  if (!g?.members?.cache) return '0';
  const n = g.members.cache.filter((m) => m.user?.bot).size;
  return String(n);
}

export function server_botcount_ordinal(ctx, argument) {
  const g = getGuild(ctx);
  if (!g?.members?.cache) return '0th';
  const n = g.members.cache.filter((m) => m.user?.bot).size;
  return ordinal(n);
}

export function server_rolecount(ctx, argument) {
  const g = getGuild(ctx);
  if (!g?.roles?.cache) return '0';
  return String(g.roles.cache.size);
}

export function server_channelcount(ctx, argument) {
  const g = getGuild(ctx);
  if (!g?.channels?.cache) return '0';
  return String(g.channels.cache.size);
}

function randomMember(guild, filterBots = false) {
  if (!guild?.members?.cache?.size) return null;
  const cache = filterBots
    ? guild.members.cache.filter((m) => !m.user?.bot)
    : guild.members.cache;
  const arr = [...cache.values()];
  return arr[Math.floor(Math.random() * arr.length)] ?? null;
}

export function server_randommember(ctx, argument) {
  const g = getGuild(ctx);
  const m = randomMember(g, false);
  return m ? `<@${m.id}>` : '';
}

export function server_randommember_tag(ctx, argument) {
  const g = getGuild(ctx);
  const m = randomMember(g, false);
  if (!m?.user) return '';
  return m.user.tag ?? `${m.user.username}#${m.user.discriminator ?? '0'}`;
}

export function server_randommember_nobots(ctx, argument) {
  const g = getGuild(ctx);
  const m = randomMember(g, true);
  return m ? `<@${m.id}>` : '';
}

export function server_owner(ctx, argument) {
  const g = getGuild(ctx);
  const ownerId = g?.ownerId ?? g?.owner?.id;
  return ownerId ? `<@${ownerId}>` : '';
}

export function server_owner_id(ctx, argument) {
  const g = getGuild(ctx);
  return g?.ownerId ?? g?.owner?.id ?? '';
}

export function server_createdate(ctx, argument) {
  const g = getGuild(ctx);
  if (!g?.createdAt) return '';
  return g.createdAt.toLocaleString('vi-VN');
}

const BOOST_LEVELS = [0, 2, 7, 14];
const BOOST_LEVEL_REQUIRED = [0, 2, 7, 14];

export function server_boostlevel(ctx, argument) {
  const g = getGuild(ctx);
  const n = g?.premiumTier ?? 0;
  return String(n);
}

export function server_boostcount(ctx, argument) {
  const g = getGuild(ctx);
  const n = g?.premiumSubscriptionCount ?? 0;
  return String(n);
}

export function server_nextboostlevel(ctx, argument) {
  const g = getGuild(ctx);
  const current = g?.premiumTier ?? 0;
  if (current >= 3) return '3';
  return String(current + 1);
}

export function server_nextboostlevel_required(ctx, argument) {
  const g = getGuild(ctx);
  const current = g?.premiumTier ?? 0;
  const idx = Math.min(current + 1, 3);
  return String(BOOST_LEVEL_REQUIRED[idx] ?? 14);
}

export function server_nextboostlevel_until_required(ctx, argument) {
  const g = getGuild(ctx);
  const count = g?.premiumSubscriptionCount ?? 0;
  const current = g?.premiumTier ?? 0;
  const nextRequired = BOOST_LEVEL_REQUIRED[Math.min(current + 1, 3)] ?? 14;
  const need = Math.max(0, nextRequired - count);
  return String(need);
}
