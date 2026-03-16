import { MessageFlags } from 'discord.js';
import * as api from '../api.js';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  const embedId = interaction.options?.getString('target')?.trim() || actionContext?.targetId;
  if (!embedId) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Thiếu embed cần xóa.'));
    return;
  }

  let confirmName = null;
  if (actionContext?.modalValues) {
    confirmName = actionContext.modalValues.confirm_name?.trim() ?? '';
  } else if (interaction.options?.getString('confirm') != null) {
    confirmName = interaction.options.getString('confirm').trim();
  }

  if (confirmName === null) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Thiếu xác nhận (gõ tên embed).'));
    return;
  }

  let embedRow;
  try {
    embedRow = await api.getEmbed(guild.id, embedId);
  } catch (err) {
    console.error('[EmbedDelete] getEmbed', err);
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Không tìm thấy embed.'));
    return;
  }
  if (!embedRow) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Không tìm thấy embed.'));
    return;
  }

  const expectedName = (embedRow.embed_name ?? '').trim();
  if (confirmName !== expectedName) {
    const msg = api.formatEphemeralContent('Tên không khớp. Không xóa.');
    if (interaction.deferred) await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    else await interaction.editReply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    return;
  }

  try {
    await api.deleteEmbed(guild.id, embedId);
  } catch (err) {
    console.error('[EmbedDelete]', err);
    const payload = { content: api.formatEphemeralContent('Không thể xóa embed.'), flags: MessageFlags.Ephemeral };
    if (interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.editReply(payload).catch(() => {});
    return;
  }

  const successContent = api.formatEphemeralContent('Embed đã xóa.');
  if (interaction.message) {
    await interaction.message
      .edit({ content: successContent, embeds: [], components: [] })
      .catch(() => {});
  } else {
    await interaction.editReply({ content: successContent, flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
