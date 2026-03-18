import { EMBED_COLORS } from './schema.js';
import { resolveEmbed } from './.embedContext.js';

function formatMemberStatus(profile) {
  const status = profile?.member_status ?? 'Good';
  const expires = profile?.member_expires;
  if (!expires || status === 'Good' || status === 'Newbie' || status === 'Leaved') return status;
  const ts = Math.floor(new Date(expires).getTime() / 1000);
  return `${status}: <t:${ts}:R>`;
}

/**
 * Trả về embed data Member Info (đã resolve placeholders qua parser).
 * @param {import('discord.js').GuildMember} member
 * @param {{ member_status?: string, member_expires?: string, member_level?: number, level?: number }} profile
 * @param {{ imageURL?: string }} options
 * @returns {Promise<object>}
 */
export async function getMemberInfoEmbed(member, profile, options = {}) {
  const level = profile?.member_level ?? profile?.level ?? 0;
  const statusText = formatMemberStatus(profile);
  const highestRole =
    member.roles?.highest && member.roles.highest.id !== member.guild.id
      ? member.roles.highest.toString()
      : 'None';

  const embed = {
    title: '✦ {user_name}',
    color: EMBED_COLORS.MEMBER_INFO,
    thumbnail: { url: '{user_avatar}' },
    timestamp: new Date().toISOString(),
    fields: [
      { name: 'UID', value: '{user_id}', inline: true },
      { name: 'Name', value: '{user_nick}', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Join Discord', value: '{user_createdate}', inline: true },
      { name: 'Join Server', value: '{user_joindate}', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Level', value: String(level), inline: true },
      { name: 'Status', value: statusText, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Role', value: highestRole, inline: false },
    ],
  };
  if (options.imageURL) embed.image = { url: options.imageURL };

  return resolveEmbed(embed, { member, guild: member?.guild ?? null });
}