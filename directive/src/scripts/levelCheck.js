import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { EMBED_COLORS } from '../embeds/schema.js';
import { resolveEmbed } from '../embeds/.embedContext.js';
import { blank_banner } from '../customs/handlers/placeholders/links.js';

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
    const profile = await api.getMember(guild.id, member.id);

    const embed = {
      title: 'Your Level',
      description: 'Level: {member_level}',
      color: EMBED_COLORS.MEMBER_INFO,
      thumbnail: { url: '{user_avatar}' },
      image: { url: blank_banner() },
    };

    const resolved = await resolveEmbed(embed, {
      member,
      guild,
      memberProfile: profile,
    });

    await interaction.editReply({ embeds: [resolved], flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error('[levelCheck]', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Failed to fetch level data.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}
