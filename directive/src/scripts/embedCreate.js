import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { getDefaultEmbedTemplate } from '../embeds/embedTemplate.js';
import { buildEmbedEditRow } from '../embeds/embedEditUtils.js';
import { getEmbedBuilder } from '../embedRoutes.js';

export async function run(interaction, client) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  const name = interaction.options?.getString('name')?.trim();
  if (!name) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Hãy nhập tên embed.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  try {
    await api.ensureServer(guild.id);
    const template = getDefaultEmbedTemplate();
    const created = await api.createEmbed(guild.id, name, template);
    const member = interaction.member ?? null;
    const channel = interaction.channel ?? null;
    const buildEmbed = getEmbedBuilder('EmbedCreate');
    const resolved = buildEmbed
      ? await buildEmbed(created.embed ?? template, { member, guild, channel })
      : null;
    if (!resolved) {
      await interaction.editReply({ content: api.formatEphemeralContent('Không tạo được embed.') }).catch(() => {});
      return;
    }
    const components = buildEmbedEditRow(created.embed_id);
    await interaction.editReply({ content: '', embeds: [resolved], components }).catch(() => {});
  } catch (err) {
    console.error('[EmbedCreate]', err);
    await interaction.followUp({ content: api.formatEphemeralContent('Không thể tạo embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
    await interaction.editReply({ content: '', embeds: [], components: [] }).catch(() => {});
  }
}
