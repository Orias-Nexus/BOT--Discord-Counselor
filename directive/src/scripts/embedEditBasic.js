import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { updateEmbedAndResolve } from '../embeds/embedEdit.js';
import { mergeBasic } from '../utils/embedFormatters.js';

export async function run(interaction, client, actionContext) {
  const guild = interaction?.guild;
  const modalValues = actionContext?.modalValues;
  const embedId = actionContext?.targetId;

  if (!guild || !embedId || !modalValues) return;
  try {
    const meta = { member: interaction.member ?? null, guild, channel: interaction.channel ?? null };
    const { resolved, components } = await updateEmbedAndResolve(
      guild.id,
      embedId,
      (embed) => mergeBasic(embed, modalValues),
      meta
    );
    if (interaction.message) {
      await interaction.message.edit({ embeds: [resolved], components }).catch(() => {});
    }
  } catch (err) {
    console.error('[EmbedEditBasic]', err);
    await interaction.followUp({ content: api.formatEphemeralContent('Update failed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
