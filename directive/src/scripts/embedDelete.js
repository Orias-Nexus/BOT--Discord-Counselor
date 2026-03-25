import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { deleteEmbedEditCache } from '../utils/embedEditCache.js';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const embedId = interaction.options?.getString('target')?.trim() || actionContext?.targetId;
  if (!embedId) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed to delete is missing.'));
    return;
  }

  let confirmName = null;
  if (actionContext?.modalValues) {
    confirmName = actionContext.modalValues.confirm_name?.trim() ?? '';
  } else if (interaction.options?.getString('confirm') != null) {
    confirmName = interaction.options.getString('confirm').trim();
  }

  if (confirmName === null) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Confirm by typing the embed name.'));
    return;
  }

  let embedRow;
  try {
    embedRow = await api.getEmbed(guild.id, embedId);
  } catch (err) {
    console.error('[EmbedDelete] getEmbed', err);
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed not found.'));
    return;
  }
  if (!embedRow) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed not found.'));
    return;
  }

  const expectedName = (embedRow.embed_name ?? '').trim();
  if (confirmName !== expectedName) {
    const msg = api.formatEphemeralContent('Name does not match. Delete cancelled.');
    if (interaction.deferred) await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    else await interaction.editReply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    return;
  }

  try {
    await api.deleteEmbed(guild.id, embedId);
    deleteEmbedEditCache(guild.id, embedId);
  } catch (err) {
    console.error('[EmbedDelete]', err);
    const payload = { content: api.formatEphemeralContent('Could not delete embed.'), flags: MessageFlags.Ephemeral };
    if (interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.editReply(payload).catch(() => {});
    return;
  }

  const successContent = api.formatEphemeralContent('Embed deleted.');
  if (interaction.message) {
    await interaction.message
      .edit({ content: successContent, embeds: [], components: [] })
      .catch(() => {});
  } else {
    await interaction.editReply({ content: successContent, flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
