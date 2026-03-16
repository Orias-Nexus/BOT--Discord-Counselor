import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { getEmbedBuilder } from '../embedRoutes.js';
import { buildEmbedEditRow } from '../embeds/embedEditUtils.js';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const embedId = interaction.options?.getString('target')?.trim() || actionContext?.targetId;
  const newName =
    interaction.options?.getString('newname')?.trim() || actionContext?.modalValues?.newname?.trim();
  if (!embedId || !newName) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed or new name missing.'));
    return;
  }
  const isFromModal = !!actionContext?.modalValues;
  if (isFromModal) {
    try {
      await api.updateEmbed(guild.id, embedId, { embed_name: newName });
      if (interaction.message) {
        const updated = await api.getEmbed(guild.id, embedId);
        if (updated) {
          const member = interaction.member ?? null;
          const channel = interaction.channel ?? null;
          const buildEmbed = getEmbedBuilder('EmbedEdit');
          const resolved = buildEmbed ? await buildEmbed(updated.embed ?? {}, { member, guild, channel }) : null;
          if (resolved) {
            const components = buildEmbedEditRow(embedId);
            await interaction.message.edit({ content: '', embeds: [resolved], components }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error('[EmbedRename]', err);
      await interaction.followUp({
        content: api.formatEphemeralContent('Rename failed.'),
        flags: MessageFlags.Ephemeral,
      }).catch(() => {});
    }
    return;
  }
  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    await api.ensureServer(guild.id);
    await api.updateEmbed(guild.id, embedId, { embed_name: newName });
    await interaction.editReply({
      content: api.formatEphemeralContent(`Embed renamed to **${newName}**.`),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  } catch (err) {
    console.error('[EmbedRename]', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Could not rename embed.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}
