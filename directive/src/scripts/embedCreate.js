import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
<<<<<<< HEAD
import { buildEmbedEditComponents } from '../utils/components.js';
import { getEmbedBuilder } from '../embedRoutes.js';
import { getDefaultEmbedTemplate } from '../embeds/index.js';
=======
import { getDefaultEmbedTemplate } from '../embeds/embedTemplate.js';
import { buildEmbedEditRow } from '../embeds/embedEditUtils.js';
import { getEmbedBuilder } from '../embedRoutes.js';
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)

export async function run(interaction, client) {
  const guild = interaction?.guild;
  if (!guild) {
<<<<<<< HEAD
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    return;
  }
  const name = interaction.options?.getString('name')?.trim();
  if (!name) {
<<<<<<< HEAD
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Enter an embed name.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Hãy nhập tên embed.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Enter an embed name.'));
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
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
<<<<<<< HEAD
      
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
=======
    if (!resolved) {
      await interaction.editReply({ content: api.formatEphemeralContent('Could not create embed.') }).catch(() => {});
      return;
    }
    const components = buildEmbedEditRow(created.embed_id);
    await interaction.editReply({ content: '', embeds: [resolved], components }).catch(() => {});
  } catch (err) {
    console.error('[EmbedCreate]', err);
<<<<<<< HEAD
    await interaction.followUp({ content: api.formatEphemeralContent('Không thể tạo embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await interaction.followUp({ content: api.formatEphemeralContent('Could not create embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    await interaction.editReply({ content: '', embeds: [], components: [] }).catch(() => {});
  }
}
