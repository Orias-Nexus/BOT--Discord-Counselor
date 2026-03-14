import { EMBED_COLORS } from './schema.js';

function formatMemberStatus(profile) {
  const status = profile?.member_status ?? 'Good';
  const expires = profile?.member_expires;
  if (!expires || status === 'Good' || status === 'Newbie' || status === 'Leaved') return status;
  const ts = Math.floor(new Date(expires).getTime() / 1000);
  return `${status}: <t:${ts}:R>`;
}

/**
 * Trả về embed data Member Info. channel.send({ embeds: [data] }) hoặc editReply({ embeds: [data] }).
 * @param {import('discord.js').GuildMember} member
 * @param {{ member_status?: string, member_expires?: string, member_level?: number, level?: number }} profile
 * @param {{ imageURL?: string }} options
 * @returns {object}
 */
export function getMemberInfoEmbed(member, profile, options = {}) {
  const user = member.user;
  const status = profile?.member_status ?? 'Good';
  const level = profile?.member_level ?? profile?.level ?? 0;
  const statusText = formatMemberStatus(profile);
  const joinDiscord = user.createdAt ? user.createdAt.toLocaleString('vi-VN') : 'N/A';
  const joinServer = member.joinedAt ? member.joinedAt.toLocaleString('vi-VN') : 'N/A';
  const highestRole =
    member.roles?.highest && member.roles.highest.id !== member.guild.id
      ? member.roles.highest.toString()
      : 'None';

  const embed = {
    title: `✦ ${user.username}`,
    color: EMBED_COLORS.MEMBER_INFO,
    thumbnail: user.displayAvatarURL({ size: 256 }) ? { url: user.displayAvatarURL({ size: 256 }) } : undefined,
    timestamp: new Date().toISOString(),
    fields: [
      { name: 'UID', value: user.id, inline: true },
      { name: 'Name', value: member.displayName, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Join Discord', value: joinDiscord, inline: true },
      { name: 'Join Server', value: joinServer, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Level', value: String(level), inline: true },
      { name: 'Status', value: statusText, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Role', value: highestRole, inline: false },
    ],
  };
  if (options.imageURL) embed.image = { url: options.imageURL };
  return embed;
}
