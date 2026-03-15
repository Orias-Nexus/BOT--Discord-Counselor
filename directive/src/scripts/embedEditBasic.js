import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
<<<<<<< HEAD
import { updateEmbedAndResolve } from '../embeds/embedEdit.js';
import { mergeBasic } from '../utils/embedFormatters.js';
=======
import { updateEmbedAndResolve, mergeBasic } from '../embeds/embedEditUtils.js';
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)

export async function run(interaction, client, actionContext) {
  const guild = interaction?.guild;
  const modalValues = actionContext?.modalValues;
  const embedId = actionContext?.targetId;

  if (!guild || !embedId || !modalValues) return;
  try {
    const meta = { member: interaction.member ?? null, guild, channel: interaction.channel ?? null };
<<<<<<< HEAD
    const { resolved, components } = await updateEmbedAndResolve(
=======
    const { resolved, row } = await updateEmbedAndResolve(
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
      guild.id,
      embedId,
      (embed) => mergeBasic(embed, modalValues),
      meta
    );
    if (interaction.message) {
<<<<<<< HEAD
      await interaction.message.edit({ embeds: [resolved], components }).catch(() => {});
    }
  } catch (err) {
    console.error('[EmbedEditBasic]', err);
    await interaction.followUp({ content: api.formatEphemeralContent('Update failed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
=======
      await interaction.message.edit({ embeds: [resolved], components: row }).catch(() => {});
    }
  } catch (err) {
    console.error('[EmbedEditBasic]', err);
<<<<<<< HEAD
    await interaction.followUp({ content: api.formatEphemeralContent('Không thể cập nhật.'), flags: MessageFlags.Ephemeral }).catch(() => {});
>>>>>>> 0e48cdd (Add new scripts for managing greeting and leaving channels and messages: Implement GreetingChannel, GreetingMessage, LeavingChannel, and LeavingMessage to enhance server interaction capabilities. Introduce embed handling for these messages, allowing for dynamic content resolution and improved user engagement.)
=======
    await interaction.followUp({ content: api.formatEphemeralContent('Update failed.'), flags: MessageFlags.Ephemeral }).catch(() => {});
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
  }
}
