import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { updateEmbedAndResolve, mergeFooter } from '../embeds/embedEditUtils.js';

export async function run(interaction, client, actionContext) {
  const guild = interaction?.guild;
  const modalValues = actionContext?.modalValues;
  const embedId = actionContext?.targetId;

  if (!guild || !embedId || !modalValues) return;
  try {
    const meta = { member: interaction.member ?? null, guild, channel: interaction.channel ?? null };
    const { resolved, row } = await updateEmbedAndResolve(
      guild.id,
      embedId,
      (embed) => mergeFooter(embed, modalValues),
      meta
    );
    if (interaction.message) {
      await interaction.message.edit({ embeds: [resolved], components: row }).catch(() => {});
    }
  } catch (err) {
    console.error('[EmbedEditFooter]', err);
    await interaction.followUp({ content: api.formatEphemeralContent('Không thể cập nhật.'), flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
