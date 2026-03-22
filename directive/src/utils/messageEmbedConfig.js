import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { resolveString } from '../embeds/.embedContext.js';

/**
 * Shared handler for GreetingMessage/LeavingMessage/BoostingMessage scripts.
 * Keeps output identical to existing scripts.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {'Greeting'|'Leaving'|'Boosting'|'Leveling'|'Logging'} messageType
 */
export async function setMessageEmbedByName(interaction, messageType) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  const embedName = interaction.options?.getString('embed')?.trim();
  if (!embedName) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Enter an embed name.'));
    return;
  }

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    await api.ensureServer(guild.id);
    const list = await api.listEmbeds(guild.id);
    const embedRow = Array.isArray(list) ? list.find((e) => e.embed_name === embedName) : null;
    if (!embedRow) {
      await interaction.editReply({
        content: api.formatEphemeralContent(`Embed "${embedName}" not found. Create with /embedcreate first.`),
        flags: MessageFlags.Ephemeral,
      }).catch(() => {});
      return;
    }

    await api.setMessageEmbed(guild.id, messageType, embedRow.embed_id);

    const text = await resolveString(`Completed Set {embed_name} as ${messageType} Message`, {
      placeholderCache: { embed_name: embedRow.embed_name },
    });
    await interaction.editReply({ content: text, flags: MessageFlags.Ephemeral }).catch(() => {});
  } catch (err) {
    console.error(`[${messageType}Message]`, err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Update failed.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}

