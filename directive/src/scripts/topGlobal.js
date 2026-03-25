import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { getLeaderboardEmbed } from '../embeds/levelInfo.js';

export async function run(interaction) {
  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const [entries, rankData] = await Promise.all([
      api.getGlobalLeaderboard(20),
      api.getGlobalRank(interaction.user.id).catch(() => null),
    ]);

    const embed = getLeaderboardEmbed(entries, 'global', interaction.guild ?? null, {
      callerRank: rankData?.rank,
      callerUserId: interaction.user.id,
    });

    await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error('[topGlobal]', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Failed to fetch leaderboard.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}
