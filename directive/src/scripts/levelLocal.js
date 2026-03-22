import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { getLocalLevelEmbed } from '../embeds/levelInfo.js';

export async function run(interaction) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  const target = interaction.options?.getUser('target') ?? interaction.user;
  const member = await guild.members.fetch(target.id).catch(() => null);
  if (!member) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Member not found in this server.'));
    return;
  }

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    await api.ensureMember(guild.id, member.id);
    const [profile, rankData] = await Promise.all([
      api.getMember(guild.id, member.id),
      api.getLocalRank(guild.id, member.id),
    ]);

    const level = profile?.member_level ?? 0;
    const exp = profile?.member_exp ?? 0;
    const progress = await api.getLevelProgress(exp, level);

    const embed = await getLocalLevelEmbed(member, profile, {
      rank: rankData?.rank ?? '?',
      currentLevelExp: progress?.currentLevelExp ?? 0,
      nextLevelExp: progress?.nextLevelExp ?? null,
    });

    await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error('[levelLocal]', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Failed to fetch level data.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}
