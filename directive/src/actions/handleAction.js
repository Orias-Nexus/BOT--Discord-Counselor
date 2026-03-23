import { MessageFlags } from 'discord.js';
import * as api from '../api.js';
import { ACTION_PREFIX, ACTION_SELECT_PREFIX } from '../utils/components.js';
import { runScript } from '../scripts/runScript.js';
import { getVoiceRoomControlOwner } from '../scripts/channelCreate.js';
import { SCRIPTS_NEED_MODAL, getModalForScript, buildModalContext } from './modalConfig.js';
import { getEmbedUpdatePayload, resetComponentsOnly } from './embedUpdate.js';

function parseButtonCustomId(customId) {
  if (!customId || !customId.startsWith(ACTION_PREFIX)) return null;
  const rest = customId.slice(ACTION_PREFIX.length);
  const idx = rest.indexOf('_');
  if (idx <= 0) return null;
  return { scriptName: rest.slice(0, idx), contextId: rest.slice(idx + 1) || null };
}

function parseSelectCustomId(customId) {
  if (!customId || !customId.startsWith(ACTION_SELECT_PREFIX)) return null;
  return { contextId: customId.slice(ACTION_SELECT_PREFIX.length) || null };
}

/** True if button opens a modal (no immediate defer). Used in index for early defer on non-modal buttons. */
export function isButtonModalScript(customId) {
  const parsed = parseButtonCustomId(customId);
  return parsed ? SCRIPTS_NEED_MODAL.has(parsed.scriptName) : false;
}

/** True if button only updates message (deferUpdate, no reply). */
export function isButtonDeferUpdate(customId) {
  return false;
}

export async function handleAction(interaction, client, timing = {}) {
  let scriptName, contextId;

  if (interaction.isButton()) {
    const parsed = parseButtonCustomId(interaction.customId);
    if (!parsed) return false;
    scriptName = parsed.scriptName;
    contextId = parsed.contextId;
  } else if (interaction.isStringSelectMenu()) {
    const parsed = parseSelectCustomId(interaction.customId);
    if (!parsed) return false;
    scriptName = interaction.values?.[0];
    contextId = parsed.contextId;
    if (!scriptName) return false;
  } else {
    return false;
  }
  const ownerOnlyRoomScripts = new Set([
    'ChannelPrivate',
    'ChannelPublic',
    'ChannelSync',
    'ChannelSFW',
    'ChannelNSFW',
    'ChannelClone',
  ]);

  if (ownerOnlyRoomScripts.has(scriptName)) {
    const controlOwnerId = getVoiceRoomControlOwner(interaction.message?.id);
    if (controlOwnerId && interaction.user?.id !== controlOwnerId) {
      const deniedPayload = {
        content: api.formatEphemeralContent('Only the room owner can use these controls.'),
        flags: MessageFlags.Ephemeral,
      };
      if (interaction.deferred) await interaction.editReply(deniedPayload).catch(() => {});
      else if (interaction.replied) await interaction.followUp(deniedPayload).catch(() => {});
      else await interaction.reply(deniedPayload).catch(() => {});
      return true;
    }
  }

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
    if ((scriptName === 'ChannelSlow' || scriptName === 'ChannelBitrate' || scriptName === 'ChannelLimit') && contextId && guild) {
      const channel = guild.channels.cache.get(contextId) ?? null;
      if (channel) extra = { ...extra, channel };
    }
    const modal = getModalForScript(scriptName, contextPart, extra);
    try {
      if (modal) await interaction.showModal(modal);
    } catch (err) {
      if (api.isUnknownInteraction(err)) {
        console.warn('[handleAction] showModal 10062 - token expired before opening form, click again.');
        return true;
      }
      console.error('[handleAction] showModal', err);
      const payload = { content: api.formatEphemeralContent('Could not open input form.'), flags: MessageFlags.Ephemeral };
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
        console.warn('[handleAction] deferReply 10062 - click the button again.');
        return true;
      }
      throw err;
    }
  }
  try {
    const scriptResult = await runScript(scriptName, interaction, client, actionContext);
    const payload = await getEmbedUpdatePayload(scriptName, interaction, actionContext, scriptResult);
    if (interaction.message) {
      if (payload) {
        await interaction.message.edit(payload).catch(() => {});
      } else {
        const componentsOnly = resetComponentsOnly(scriptName, interaction, actionContext);
        if (componentsOnly) {
          await interaction.message.edit({ components: componentsOnly }).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.error('[handleAction]', err);
    if (api.isUnknownInteraction(err)) return true;
    const payload = { content: api.formatEphemeralContent('Action failed.'), flags: MessageFlags.Ephemeral };
    if (interaction.deferred) await interaction.editReply(payload).catch(() => {});
    else if (interaction.replied) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
  return true;
}
