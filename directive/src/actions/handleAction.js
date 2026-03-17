import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
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

/** True nếu nút chỉ cập nhật message (deferUpdate, không reply). */
export function isButtonDeferUpdate(customId) {
  return false;
}

export async function handleAction(interaction, client, timing = {}) {
  if (!interaction.isButton()) return false;
  const parsed = parseCustomId(interaction.customId);
  if (!parsed) return false;
  const { scriptName, contextId } = parsed;
  if (SCRIPTS_NEED_MODAL.has(scriptName)) {
    const guildId = interaction.guildId ?? '';
    const guild = interaction.guild ?? null;
    const contextPart = buildModalContext(guildId, contextId ?? null);
    let extra = {};
    if ((scriptName.startsWith('EmbedEdit') || scriptName === 'EmbedRename' || scriptName === 'EmbedDelete') && contextId && guildId) {
      try {
        const embedRow = await api.getEmbed(guildId, contextId);
        if (embedRow) extra = { embed: embedRow.embed, embed_name: embedRow.embed_name };
      } catch (_) {}
    }
    if ((scriptName === 'StatusTimeout' || scriptName === 'StatusRole' || scriptName === 'StatusUnrole') && contextId === 'server' && guildId) {
      try {
        const [server, times] = await Promise.all([
          api.getServer(guildId).catch(() => null),
          scriptName === 'StatusTimeout' ? api.getTimes(guildId).catch(() => null) : null,
        ]);
        extra = { ...extra, guild, server, times };
      } catch (_) {}
    }
    if ((scriptName === 'MemberRename' || scriptName === 'MemberSetlevel') && contextId && guild) {
      try {
        const member = await guild.members.fetch(contextId).catch(() => null);
        const profile = member ? await api.getMember(guildId, contextId).catch(() => null) : null;
        if (member) extra = { ...extra, member, profile };
      } catch (_) {}
    }
    const modal = getModalForScript(scriptName, contextPart, extra);
    try {
      if (modal) await interaction.showModal(modal);
    } catch (err) {
      if (api.isUnknownInteraction(err)) {
        console.warn('[handleAction] showModal 10062 - token hết hạn trước khi mở form, bấm lại nút.');
        return true;
      }
      console.error('[handleAction] showModal', err);
      const payload = { content: api.formatEphemeralContent('Không thể mở form nhập.'), flags: MessageFlags.Ephemeral };
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
      if (api.isUnknownInteraction(err)) {
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
    if (api.isUnknownInteraction(err)) return true;
    const payload = { content: api.formatEphemeralContent('Có lỗi khi thực hiện.'), flags: MessageFlags.Ephemeral };
    if (interaction.deferred) await interaction.editReply(payload).catch(() => {});
    else if (interaction.replied) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
  return true;
}
