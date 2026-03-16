import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
<<<<<<< HEAD
import { buildEmbedEditComponents } from '../utils/components.js';
import { getEmbedBuilder } from '../embedRoutes.js';
import { setEmbedEditCache } from '../utils/embedEditCache.js';
=======
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
  const embedId = interaction.options?.getString('target')?.trim();
  if (!embedId) {
<<<<<<< HEAD
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Select an embed to edit.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Hãy chọn embed cần sửa.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Select an embed to edit.'));
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  try {
    await api.ensureServer(guild.id);
    const embedRow = await api.getEmbed(guild.id, embedId);
    if (!embedRow) {
      await interaction.followUp({
<<<<<<< HEAD
<<<<<<< HEAD
        content: api.formatEphemeralContent('Embed not found.'),
=======
        content: api.formatEphemeralContent('Không tìm thấy embed.'),
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
        content: api.formatEphemeralContent('Embed not found.'),
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
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
<<<<<<< HEAD
<<<<<<< HEAD
      await interaction.editReply({ content: api.formatEphemeralContent('Could not load embed.') }).catch(() => {});
      return;
    }
    const components = buildEmbedEditComponents(embedRow.embed_id);
    setEmbedEditCache(guild.id, embedRow.embed_id, {
      embed: embedRow.embed ?? {},
      embed_name: embedRow.embed_name ?? null,
    });
    await interaction.editReply({ content: '', embeds: [resolved], components }).catch(() => {});
  } catch (err) {
    console.error('[EmbedEdit]', err);
    await interaction.followUp({ content: api.formatEphemeralContent('Could not load embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
=======
      await interaction.editReply({ content: api.formatEphemeralContent('Không tải được embed.') }).catch(() => {});
=======
      await interaction.editReply({ content: api.formatEphemeralContent('Could not load embed.') }).catch(() => {});
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
      return;
    }
    const components = buildEmbedEditRow(embedRow.embed_id);
    await interaction.editReply({ content: '', embeds: [resolved], components }).catch(() => {});
  } catch (err) {
    console.error('[EmbedEdit]', err);
<<<<<<< HEAD
    await interaction.followUp({ content: api.formatEphemeralContent('Không thể tải embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await interaction.followUp({ content: api.formatEphemeralContent('Could not load embed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    await interaction.editReply({ content: '', embeds: [], components: [] }).catch(() => {});
  }
}
