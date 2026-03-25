import { MessageFlags } from '../discord.js';
import * as api from '../api.js';
import { buildEmbedEditComponents } from '../utils/components.js';
import { getEmbedBuilder } from '../embedRoutes.js';
import { getDefaultEmbedTemplate } from '../embeds/index.js';

export async function run(interaction, client) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const name = interaction.options?.getString('name')?.trim();
  if (!name) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Enter an embed name.'));
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
      
    // Discord API requires at least some text content if fields/author/footer/image are absent.
    const hasContent = resolved && (
      resolved.title || 
      resolved.description || 
      (resolved.fields && resolved.fields.length > 0) ||
      resolved.author || 
      resolved.footer || 
      resolved.image || 
      resolved.thumbnail
    );
    if (!hasContent) {
      resolved.description = '*(Empty Embed)*';
    }

    if (!resolved) {
      await interaction.editReply({ content: api.formatEphemeralContent('Could not create embed.') }).catch(() => {});
      return;
    }
    const components = buildEmbedEditComponents(created.embed_id);
    await interaction.editReply({ content: '', embeds: [resolved], components }).catch(err => {
      console.error('[EmbedCreate] editReply error:', err);
      return interaction.followUp({ content: api.formatEphemeralContent('Could not display embed: ' + err.message), flags: MessageFlags.Ephemeral }).catch(() => {});
    });
  } catch (err) {
    console.error('[EmbedCreate]', err);
    await interaction.followUp({ content: api.formatEphemeralContent('Could not create embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
    await interaction.editReply({ content: '', embeds: [], components: [] }).catch(() => {});
  }
}
