import { version } from '../discord.js';
import { EMBED_COLORS } from './schema.js';
import { getSlashCommands } from '../slashs/commands.js';
import { blank_banner } from '../customs/handlers/placeholders/links.js';

const BOT_NAME = 'Counselor';
const DEVELOPER = 'Orias';
const REPO_URL = 'https://github.com/Orias1701';
const BIOGRAPHY = [
  `**${BOT_NAME}** is a multipurpose Discord bot designed for server management,`,
  'moderation, leveling, custom embeds, and a powerful custom command engine.',
  `Developed with ❤ by **[${DEVELOPER}](${REPO_URL})**.`,
].join(' ');

/**
 * @param {import('discord.js').Client} client
 * @returns {object}
 */
export function getDashboardEmbed(client) {
  const slashData = getSlashCommands();
  const commandList = slashData.map((cmd) => `\`/${cmd.name}\``).join(', ');

  const uptime = client.uptime ?? 0;
  const hours = Math.floor(uptime / 3_600_000);
  const minutes = Math.floor((uptime % 3_600_000) / 60_000);
  const uptimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return {
    title: `✦ ${BOT_NAME} — Dashboard`,
    color: EMBED_COLORS.DEFAULT,
    thumbnail: client.user?.displayAvatarURL({ size: 256 })
      ? { url: client.user.displayAvatarURL({ size: 256 }) }
      : undefined,
    description: BIOGRAPHY,
    fields: [
      { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
      { name: 'Uptime', value: uptimeStr, inline: true },
      { name: 'Discord.js', value: `v${version}`, inline: true },
      { name: `Slash Commands (${slashData.length})`, value: commandList, inline: false },
    ],
    image: { url: blank_banner() },
    footer: { text: `${BOT_NAME} • ${DEVELOPER}` },
  };
}
