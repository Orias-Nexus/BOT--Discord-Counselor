import { EMBED_COLORS } from './schema.js';
import { resolveEmbed } from './.embedContext.js';
import { blank_banner } from '../customs/handlers/placeholders/links.js';

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
    image: { url: blank_banner() },
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
    image: { url: blank_banner() },
    footer: { text: 'Global Ranking' },
    timestamp: new Date().toISOString(),
  };

  return resolveEmbed(embed, { member, guild: member?.guild ?? null, user: user?.user ?? user });
}

const RANK_WIDTH = 5;
const NAME_WIDTH = 20;
const LVL_WIDTH = 4;

function truncPad(str, len) {
  const s = String(str);
  return s.length > len ? s.slice(0, len - 1) + '…' : s.padEnd(len);
}

function resolveDisplayName(guild, userId) {
  const member = guild?.members.cache.get(userId);
  return member?.displayName ?? member?.user?.username ?? userId;
}

export function getLeaderboardEmbed(entries, type, guild, extra = {}) {
  const isLocal = type === 'local';
  const title = isLocal
    ? `✦ Leaderboard — ${guild?.name ?? 'Server'}`
    : '✦ Global Leaderboard';

  const expKey = isLocal ? 'member_exp' : 'user_exp';
  const lvlKey = isLocal ? 'member_level' : 'user_level';

  const NAME_WIDTH = 20;
  const LVL_WIDTH = 4;
  const EXP_WIDTH = 9;

  const createRow = (rankNum, userId, lvlNum, expNum, isCaller) => {
    const rankStr = String(rankNum).padStart(2, ' '); 
    const nameStr = truncPad(resolveDisplayName(guild, userId), NAME_WIDTH).padEnd(NAME_WIDTH, ' '); 
    const lvlStr = String(lvlNum ?? 0).padStart(LVL_WIDTH, ' '); 
    const expStr = String(expNum ?? 0).padStart(EXP_WIDTH, ' '); 
    const markStr = isCaller ? ' ◄' : '';
    return `${rankStr} ${nameStr} ${lvlStr} ${expStr}${markStr}`;
  };

  const lines = entries.map((e, i) => {
    return createRow(i + 1, e.user_id, e[lvlKey], e[expKey], e.user_id === extra.callerUserId);
  });

  if (extra.callerRank && extra.callerUserId) {
    const inList = entries.some((e) => e.user_id === extra.callerUserId);
    if (!inList && extra.callerRank <= 99) { 
      lines.push('...'); 
      lines.push(
        createRow(
          extra.callerRank, 
          extra.callerUserId, 
          extra.callerLevel, 
          extra.callerExp,   
          true
        )
      );
    }
  }
  
  const header = ` # ${'NAME'.padEnd(NAME_WIDTH, ' ')} ${'LVL'.padStart(LVL_WIDTH, ' ')} ${'EXP'.padStart(EXP_WIDTH, ' ')}`;
  const divider = '-'.repeat(38);

  const tableRows = [header, divider, ...lines];
  const body = lines.length > 0 ? `\`\`\`\n${tableRows.join('\n')}\n\`\`\`` : 'No data yet.';

  return {
    title,
    color: isLocal ? EMBED_COLORS.MEMBER_INFO : EMBED_COLORS.DEFAULT,
    description: body,
    image: { url: blank_banner() },
    timestamp: new Date().toISOString(),
  };
}