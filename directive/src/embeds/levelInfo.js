import { EMBED_COLORS } from './schema.js';
import { resolveEmbed } from './.embedContext.js';

const PROGRESS_LENGTH = 16;
const FILL_CHAR = '▓';
const EMPTY_CHAR = '░';

function buildProgressBar(currentExp, currentLevelExp, nextLevelExp) {
  if (nextLevelExp == null) return `${FILL_CHAR.repeat(PROGRESS_LENGTH)} MAX`;
  const needed = nextLevelExp - currentLevelExp;
  const progress = currentExp - currentLevelExp;
  const ratio = needed > 0 ? Math.min(progress / needed, 1) : 1;
  const filled = Math.round(ratio * PROGRESS_LENGTH);
  const bar = FILL_CHAR.repeat(filled) + EMPTY_CHAR.repeat(PROGRESS_LENGTH - filled);
  const pct = Math.floor(ratio * 100);
  return `${bar} ${pct}%`;
}

function formatExp(n) {
  return Number(n).toLocaleString('en-US');
}

/**
 * Build a local level embed for a member.
 * @param {import('discord.js').GuildMember} member
 * @param {{ member_exp: number, member_level: number }} profile
 * @param {{ rank?: number, currentLevelExp?: number, nextLevelExp?: number|null }} extra
 */
export async function getLocalLevelEmbed(member, profile, extra = {}) {
  const level = profile?.member_level ?? 0;
  const exp = profile?.member_exp ?? 0;
  const rank = extra.rank ?? '?';
  const currentLevelExp = extra.currentLevelExp ?? 0;
  const nextLevelExp = extra.nextLevelExp ?? null;
  const progress = buildProgressBar(exp, currentLevelExp, nextLevelExp);
  const expDisplay = nextLevelExp != null
    ? `${formatExp(exp - currentLevelExp)} / ${formatExp(nextLevelExp - currentLevelExp)}`
    : `${formatExp(exp)} (MAX)`;

  const embed = {
    title: '✦ {user_name} — Local Level',
    color: EMBED_COLORS.MEMBER_INFO,
    thumbnail: { url: '{user_avatar}' },
    fields: [
      { name: 'Level', value: String(level), inline: true },
      { name: 'Rank', value: `#${rank}`, inline: true },
      { name: 'Total EXP', value: formatExp(exp), inline: true },
      { name: 'Progress', value: `\`${progress}\`\n${expDisplay}`, inline: false },
    ],
    footer: { text: '{server_name}', icon_url: '{server_icon}' },
    timestamp: new Date().toISOString(),
  };

  return resolveEmbed(embed, { member, guild: member?.guild ?? null });
}

/**
 * Build a global level embed for a user.
 * @param {import('discord.js').GuildMember|import('discord.js').User} user
 * @param {{ user_exp: number, user_level: number }} profile
 * @param {{ rank?: number, currentLevelExp?: number, nextLevelExp?: number|null }} extra
 */
export async function getGlobalLevelEmbed(user, profile, extra = {}) {
  const level = profile?.user_level ?? 0;
  const exp = profile?.user_exp ?? 0;
  const rank = extra.rank ?? '?';
  const currentLevelExp = extra.currentLevelExp ?? 0;
  const nextLevelExp = extra.nextLevelExp ?? null;
  const progress = buildProgressBar(exp, currentLevelExp, nextLevelExp);
  const expDisplay = nextLevelExp != null
    ? `${formatExp(exp - currentLevelExp)} / ${formatExp(nextLevelExp - currentLevelExp)}`
    : `${formatExp(exp)} (MAX)`;

  const member = user.guild ? user : null;
  const embed = {
    title: '✦ {user_name} — Global Level',
    color: EMBED_COLORS.DEFAULT,
    thumbnail: { url: '{user_avatar}' },
    fields: [
      { name: 'Level', value: String(level), inline: true },
      { name: 'Rank', value: `#${rank}`, inline: true },
      { name: 'Total EXP', value: formatExp(exp), inline: true },
      { name: 'Progress', value: `\`${progress}\`\n${expDisplay}`, inline: false },
    ],
    footer: { text: 'Global Ranking' },
    timestamp: new Date().toISOString(),
  };

  return resolveEmbed(embed, { member, guild: member?.guild ?? null, user: user?.user ?? user });
}

/**
 * Build a leaderboard embed.
 * @param {Array<{ user_id: string, member_exp?: number, user_exp?: number, member_level?: number, user_level?: number }>} entries
 * @param {'local'|'global'} type
 * @param {import('discord.js').Guild|null} guild
 * @param {{ callerRank?: number, callerUserId?: string }} extra
 */
export function getLeaderboardEmbed(entries, type, guild, extra = {}) {
  const isLocal = type === 'local';
  const title = isLocal
    ? `✦ Leaderboard — ${guild?.name ?? 'Server'}`
    : '✦ Global Leaderboard';

  const lines = entries.map((e, i) => {
    const rank = i + 1;
    const expKey = isLocal ? 'member_exp' : 'user_exp';
    const lvlKey = isLocal ? 'member_level' : 'user_level';
    const exp = e[expKey] ?? 0;
    const lvl = e[lvlKey] ?? 0;
    const mention = `<@${e.user_id}>`;
    const highlight = e.user_id === extra.callerUserId ? ' ◄' : '';
    return `\`#${String(rank).padStart(2, ' ')}\` ${mention}  ·  Lv.**${lvl}**  ·  ${formatExp(exp)} EXP${highlight}`;
  });

  if (extra.callerRank && extra.callerUserId) {
    const inList = entries.some((e) => e.user_id === extra.callerUserId);
    if (!inList) {
      lines.push(`\n\`#${String(extra.callerRank).padStart(2, ' ')}\` <@${extra.callerUserId}>  ◄ You`);
    }
  }

  return {
    title,
    color: isLocal ? EMBED_COLORS.MEMBER_INFO : EMBED_COLORS.DEFAULT,
    description: lines.join('\n') || 'No data yet.',
    timestamp: new Date().toISOString(),
  };
}
