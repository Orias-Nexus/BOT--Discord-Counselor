import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { getLeaderboardEmbed } from '../embeds/levelInfo.js';

export async function run(interaction) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const [entries, rankData] = await Promise.all([
      api.getLocalLeaderboard(guild.id, 20),
      api.getLocalRank(guild.id, interaction.user.id).catch(() => null),
    ]);

    const embed = getLeaderboardEmbed(entries, 'local', guild, {
      callerRank: rankData?.rank,
      callerUserId: interaction.user.id,
    });

    await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error('[topLocal]', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Failed to fetch leaderboard.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}
