import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { buildEmbedEditRow } from '../embeds/embedEditUtils.js';
import { getEmbedBuilder } from '../embedRoutes.js';

export async function run(interaction, client) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  const embedId = interaction.options?.getString('target')?.trim();
  if (!embedId) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Hãy chọn embed cần sửa.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  try {
    await api.ensureServer(guild.id);
    const embedRow = await api.getEmbed(guild.id, embedId);
    if (!embedRow) {
      await interaction.followUp({
        content: api.formatEphemeralContent('Không tìm thấy embed.'),
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
      await interaction.editReply({ content: api.formatEphemeralContent('Không tải được embed.') }).catch(() => {});
      return;
    }
    const components = buildEmbedEditRow(embedRow.embed_id);
    await interaction.editReply({ content: '', embeds: [resolved], components }).catch(() => {});
  } catch (err) {
    console.error('[EmbedEdit]', err);
    await interaction.followUp({ content: api.formatEphemeralContent('Không thể tải embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
    await interaction.editReply({ content: '', embeds: [], components: [] }).catch(() => {});
  }
}
