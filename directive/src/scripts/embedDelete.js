import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
<<<<<<< HEAD
import { deleteEmbedEditCache } from '../utils/embedEditCache.js';
=======
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)

export async function run(interaction, client, actionContext = null) {
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
  const embedId = interaction.options?.getString('target')?.trim() || actionContext?.targetId;
  if (!embedId) {
<<<<<<< HEAD
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed to delete is missing.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Thiếu embed cần xóa.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed to delete is missing.'));
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    return;
  }

  let confirmName = null;
  if (actionContext?.modalValues) {
    confirmName = actionContext.modalValues.confirm_name?.trim() ?? '';
  } else if (interaction.options?.getString('confirm') != null) {
    confirmName = interaction.options.getString('confirm').trim();
  }

  if (confirmName === null) {
<<<<<<< HEAD
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Confirm by typing the embed name.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Thiếu xác nhận (gõ tên embed).'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Confirm by typing the embed name.'));
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    return;
  }

  let embedRow;
  try {
    embedRow = await api.getEmbed(guild.id, embedId);
  } catch (err) {
    console.error('[EmbedDelete] getEmbed', err);
<<<<<<< HEAD
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed not found.'));
    return;
  }
  if (!embedRow) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed not found.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Không tìm thấy embed.'));
    return;
  }
  if (!embedRow) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Không tìm thấy embed.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed not found.'));
    return;
  }
  if (!embedRow) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed not found.'));
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    return;
  }

  const expectedName = (embedRow.embed_name ?? '').trim();
  if (confirmName !== expectedName) {
<<<<<<< HEAD
<<<<<<< HEAD
    const msg = api.formatEphemeralContent('Name does not match. Delete cancelled.');
=======
    const msg = api.formatEphemeralContent('Tên không khớp. Không xóa.');
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    const msg = api.formatEphemeralContent('Name does not match. Delete cancelled.');
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    if (interaction.deferred) await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    else await interaction.editReply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    return;
  }

  try {
    await api.deleteEmbed(guild.id, embedId);
<<<<<<< HEAD
    deleteEmbedEditCache(guild.id, embedId);
  } catch (err) {
    console.error('[EmbedDelete]', err);
    const payload = { content: api.formatEphemeralContent('Could not delete embed.'), flags: MessageFlags.Ephemeral };
=======
  } catch (err) {
    console.error('[EmbedDelete]', err);
<<<<<<< HEAD
    const payload = { content: api.formatEphemeralContent('Không thể xóa embed.'), flags: MessageFlags.Ephemeral };
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    const payload = { content: api.formatEphemeralContent('Could not delete embed.'), flags: MessageFlags.Ephemeral };
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
    if (interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.editReply(payload).catch(() => {});
    return;
  }

<<<<<<< HEAD
<<<<<<< HEAD
  const successContent = api.formatEphemeralContent('Embed deleted.');
=======
  const successContent = api.formatEphemeralContent('Embed đã xóa.');
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
  const successContent = api.formatEphemeralContent('Embed deleted.');
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
  if (interaction.message) {
    await interaction.message
      .edit({ content: successContent, embeds: [], components: [] })
      .catch(() => {});
  } else {
    await interaction.editReply({ content: successContent, flags: MessageFlags.Ephemeral }).catch(() => {});
  }
}
