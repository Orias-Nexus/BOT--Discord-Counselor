import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { getEmbedBuilder } from '../embedRoutes.js';
<<<<<<< HEAD
import { buildEmbedEditComponents } from '../utils/components.js';
import { setEmbedEditCache } from '../utils/embedEditCache.js';
=======
import { buildEmbedEditRow } from '../embeds/embedEditUtils.js';
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
  const newName =
    interaction.options?.getString('newname')?.trim() || actionContext?.modalValues?.newname?.trim();
  if (!embedId || !newName) {
<<<<<<< HEAD
<<<<<<< HEAD
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed or new name missing.'));
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Thiếu embed hoặc tên mới.'));
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Embed or new name missing.'));
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
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
<<<<<<< HEAD
            setEmbedEditCache(guild.id, embedId, {
              embed: updated.embed ?? {},
              embed_name: updated.embed_name ?? newName,
            });
            const components = buildEmbedEditComponents(embedId);
=======
            const components = buildEmbedEditRow(embedId);
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
            await interaction.message.edit({ content: '', embeds: [resolved], components }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error('[EmbedRename]', err);
      await interaction.followUp({
<<<<<<< HEAD
<<<<<<< HEAD
        content: api.formatEphemeralContent('Rename failed.'),
=======
        content: api.formatEphemeralContent('Không thể đổi tên.'),
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
        content: api.formatEphemeralContent('Rename failed.'),
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
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
<<<<<<< HEAD
<<<<<<< HEAD
      content: api.formatEphemeralContent(`Embed renamed to **${newName}**.`),
=======
      content: api.formatEphemeralContent(`Đã đổi tên embed thành **${newName}**.`),
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
      content: api.formatEphemeralContent(`Embed renamed to **${newName}**.`),
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  } catch (err) {
    console.error('[EmbedRename]', err);
    await interaction.editReply({
<<<<<<< HEAD
<<<<<<< HEAD
      content: api.formatEphemeralContent('Could not rename embed.'),
=======
      content: api.formatEphemeralContent('Không thể đổi tên embed.'),
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
      content: api.formatEphemeralContent('Could not rename embed.'),
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}
