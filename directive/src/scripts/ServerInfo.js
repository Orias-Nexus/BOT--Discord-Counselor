import * as api from '../api.js';
import { buildServerInfoComponents } from '../utils/components.js';
import { mainImageUrl } from '../config.js';
import { getEmbedBuilder } from '../embedRoutes.js';

export async function run(interaction, client, _actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  await guild.fetch().catch(() => {});
  const buildEmbed = getEmbedBuilder('ServerInfo');
  const embed = buildEmbed ? await buildEmbed(guild, { imageURL: mainImageUrl }) : null;
  if (!embed) {
    await interaction.editReply({ content: api.formatEphemeralContent('Could not create embed.') }).catch(() => {});
    return;
  }
  const components = buildServerInfoComponents();
  await interaction.editReply({ embeds: [embed], components });
}
