import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { buildEmbedEditComponents } from '../utils/components.js';
import { getEmbedBuilder } from '../embedRoutes.js';

export async function run(interaction, client) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const embedId = interaction.options?.getString('target')?.trim();
  if (!embedId) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Select an embed to edit.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  try {
    await api.ensureServer(guild.id);
    const embedRow = await api.getEmbed(guild.id, embedId);
    if (!embedRow) {
      await interaction.followUp({
        content: api.formatEphemeralContent('Embed not found.'),
        flags: MessageFlags.Ephemeral,
      }).catch(() => {});
      await interaction.editReply({ content: '', embeds: [], components: [] }).catch(() => {});
      return;
    }
    const member = interaction.member ?? null;
    const channel = interaction.channel ?? null;
    const buildEmbed = getEmbedBuilder('EmbedEdit');
    const resolved = buildEmbed ? await buildEmbed(embedRow.embed ?? {}, { member, guild, channel }) : null;
    if (!resolved) {
      await interaction.editReply({ content: api.formatEphemeralContent('Could not load embed.') }).catch(() => {});
      return;
    }
    const components = buildEmbedEditComponents(embedRow.embed_id);
    await interaction.editReply({ content: '', embeds: [resolved], components }).catch(() => {});
  } catch (err) {
    console.error('[EmbedEdit]', err);
    await interaction.followUp({ content: api.formatEphemeralContent('Could not load embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
    await interaction.editReply({ content: '', embeds: [], components: [] }).catch(() => {});
  }
}
