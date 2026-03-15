import { MessageFlags } from 'discord.js';
import { formatEphemeralContent, isUnknownInteraction } from '../api.js';
import { ACTION_PREFIX } from '../utils/components.js';
import { runScript } from '../scripts/runScript.js';
import { SCRIPTS_NEED_MODAL, getModalForScript, buildModalContext } from './modalConfig.js';
import { getEmbedUpdatePayload } from './embedUpdate.js';

/**
 * Parse customId: action_ScriptName_contextId
 * Returns { scriptName, contextId } or null.
 */
function parseCustomId(customId) {
  if (!customId || !customId.startsWith(ACTION_PREFIX)) return null;
  const rest = customId.slice(ACTION_PREFIX.length);
  const idx = rest.indexOf('_');
  if (idx <= 0) return null;
  const scriptName = rest.slice(0, idx);
  const contextId = rest.slice(idx + 1) || null;
  return { scriptName, contextId };
}

/** True nếu nút mở modal (không defer ngay). Dùng để defer sớm trong index cho nút không modal. */
export function isButtonModalScript(customId) {
  const parsed = parseCustomId(customId);
  return parsed ? SCRIPTS_NEED_MODAL.has(parsed.scriptName) : false;
}

export async function handleAction(interaction, client, timing = {}) {
  if (!interaction.isButton()) return false;
  const parsed = parseCustomId(interaction.customId);
  if (!parsed) return false;
  const { scriptName, contextId } = parsed;
  if (SCRIPTS_NEED_MODAL.has(scriptName)) {
    const guildId = interaction.guildId ?? '';
    const contextPart = buildModalContext(guildId, contextId ?? null);
    const modal = getModalForScript(scriptName, contextPart);
    try {
      if (modal) await interaction.showModal(modal);
    } catch (err) {
      if (isUnknownInteraction(err)) {
        console.warn('[handleAction] showModal 10062 - token hết hạn trước khi mở form, bấm lại nút.');
        return true;
      }
      console.error('[handleAction] showModal', err);
      const payload = { content: formatEphemeralContent('Không thể mở form nhập.'), flags: MessageFlags.Ephemeral };
      if (!interaction.replied && !interaction.deferred) await interaction.reply(payload).catch(() => {});
      else if (interaction.deferred) await interaction.editReply(payload).catch(() => {});
    }
    return true;
  }
  const actionContext = contextId ? { targetId: contextId } : null;
  if (!interaction.replied && !interaction.deferred) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } catch (err) {
      if (isUnknownInteraction(err)) {
        console.warn('[handleAction] deferReply 10062 - bấm lại nút.');
        return true;
      }
      throw err;
    }
  }
  try {
    const scriptResult = await runScript(scriptName, interaction, client, actionContext);
    const payload = await getEmbedUpdatePayload(scriptName, interaction, actionContext, scriptResult);
    if (payload && interaction.message) {
      await interaction.message.edit(payload).catch(() => {});
    }
  } catch (err) {
    console.error('[handleAction]', err);
    if (isUnknownInteraction(err)) return true;
    const payload = { content: formatEphemeralContent('Có lỗi khi thực hiện.'), flags: MessageFlags.Ephemeral };
    if (interaction.deferred) await interaction.editReply(payload).catch(() => {});
    else if (interaction.replied) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
  return true;
}
