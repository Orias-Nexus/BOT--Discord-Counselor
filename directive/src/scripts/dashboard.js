import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getDashboardEmbed } from '../embeds/dashboardInfo.js';
import { ACTION_PREFIX } from '../utils/components.js';

export async function run(interaction, client) {
  if (!interaction.deferred) await interaction.deferReply();

  const embed = getDashboardEmbed(client);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${ACTION_PREFIX}Variables_dashboard`)
      .setLabel('Variables')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}
