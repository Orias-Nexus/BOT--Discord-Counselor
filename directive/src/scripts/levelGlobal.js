import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { getGlobalLevelEmbed } from '../embeds/levelInfo.js';

export async function run(interaction) {
  const target = interaction.options?.getUser('target') ?? interaction.user;

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const [profile, rankData] = await Promise.all([
      api.getUser(target.id),
      api.getGlobalRank(target.id),
    ]);

    if (!profile) {
      await interaction.editReply({
        content: api.formatEphemeralContent('No global profile found for this user.'),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const level = profile?.user_level ?? 0;
    const exp = profile?.user_exp ?? 0;
    const progress = await api.getLevelProgress(exp, level);

    const member = interaction.guild
      ? await interaction.guild.members.fetch(target.id).catch(() => target)
      : target;

    const embed = await getGlobalLevelEmbed(member, profile, {
      rank: rankData?.rank ?? '?',
      currentLevelExp: progress?.currentLevelExp ?? 0,
      nextLevelExp: progress?.nextLevelExp ?? null,
    });

    await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error('[levelGlobal]', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Failed to fetch level data.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}
