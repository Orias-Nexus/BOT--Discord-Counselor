import { MessageFlags } from 'discord.js';
import { formatEphemeralContent, isUnknownInteraction } from '../api.js';
import { getScriptNameByCommand } from './commands.js';
import { runScript } from '../scripts/runScript.js';
import {
  getTargetIdFromSlash,
  getEmbedUpdatePayload,
  findAndUpdateParentMessage,
  SCRIPTS_WITH_PARENT_EMBED,
} from '../actions/embedUpdate.js';

export async function handleSlash(interaction, client) {
  if (!interaction.isChatInputCommand()) return false;
  const scriptName = getScriptNameByCommand(interaction.commandName);
  if (!scriptName) return false;
  try {
    await runScript(scriptName, interaction, client);
    if (SCRIPTS_WITH_PARENT_EMBED.has(scriptName) && interaction.channel) {
      const targetId = getTargetIdFromSlash(interaction, scriptName);
      if (targetId != null) {
        const actionContext = { targetId };
        const payload = await getEmbedUpdatePayload(scriptName, interaction, actionContext);
        if (payload) {
          await findAndUpdateParentMessage(
            interaction.channel,
            interaction.client.user?.id,
            targetId,
            payload
          );
        }
      }
    }
  } catch (err) {
    console.error('[handleSlash]', err);
    if (isUnknownInteraction(err)) return true;
    const payload = { content: formatEphemeralContent('Command failed.'), flags: MessageFlags.Ephemeral };
    if (interaction.deferred) await interaction.editReply(payload).catch(() => {});
    else if (interaction.replied) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
  return true;
}
