import 'dotenv/config';
import { Client, Events, GatewayIntentBits, MessageFlags } from './discord.js';
import { logger } from './utils/logger.js'; // Init logger overrides console.log
import { initWorker } from './utils/worker.js'; // Init Redis Queue Worker
import { formatEphemeralContent, isUnknownInteraction } from './api.js';
import { getScriptNameByCommand } from './slashs/commands.js';
import { handleSlash } from './slashs/handleSlash.js';
import { handleAction, isButtonModalScript, isButtonDeferUpdate } from './actions/handleAction.js';
import { parseModalCustomId, getModalInputIds, SCRIPTS_NEED_MODAL } from './actions/modalConfig.js';
import { ACTION_SELECT_PREFIX } from './utils/components.js';
import { getEmbedUpdatePayload, resetComponentsOnly } from './actions/embedUpdate.js';
import { runScript, runEvent, loadAllScripts } from './scripts/runScript.js';
import { startExpiresCheck } from './jobs/expiresCheck.js';
import { startStatsCheck } from './jobs/statsCheck.js';
import { EVENT_HANDLERS } from './events/eventRegistry.js';
import { startApiServer } from './apiServer.js';
import { initDiscordActionsWorker } from './workers/discordActionsWorker.js';
import { isServerStatsSelectId, doSetServerStats } from './scripts/setServerStats.js';
import { EMBED_APPLY_SELECT_PREFIX } from './embeds/embedEdit.js';
import { EMBED_BY_SCRIPT } from './embedRoutes.js';
import { onMessageCreate } from './events/levelingEvent.js';
import env from './config.js';
import * as api from './api.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const pendingButtonIds = new Set();

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  console.log(`[startup] BACKEND_API_URL: ${env.backendApiUrl}`);
  console.log(`[startup] REDIS_URL: ${env.redisUrl || '(not set)'}`);
  console.log(`[startup] mainImageUrl: ${env.mainImageUrl}`);
  
  // Khởi chạy Worker lắng nghe các Task từ Redis
  initWorker(c);
  initDiscordActionsWorker(c);

  startExpiresCheck(c);
  startStatsCheck(c);
  startApiServer(c);
});

for (const { discordEvent, scriptName, buildContext } of EVENT_HANDLERS) {
  const eventName = Events[discordEvent];
  if (!eventName) continue;
  client.on(eventName, async (...payload) => {
    try {
      const context = buildContext(...payload);
      if (context == null) return;
      await runEvent(scriptName, client, context);
    } catch (err) {
      console.warn(`[${discordEvent}] ${scriptName}:`, err?.message ?? err);
    }
  });
}

/** Slash commands with target option (embed_id). */
const EMBED_TARGET_COMMANDS = ['embededit', 'embedrename', 'embeddelete', 'messagesend'];
/** Slash commands with embed option (embed_name for greeting/leaving/boosting). */
const EMBED_OPTION_COMMANDS = ['greetingmessage', 'leavingmessage', 'boostingmessage', 'levelingmessage', 'loggingmessage'];

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const cmd = interaction.commandName;
    const useEmbedId = EMBED_TARGET_COMMANDS.includes(cmd);
    const useEmbedName = EMBED_OPTION_COMMANDS.includes(cmd);
    if (useEmbedId || useEmbedName) {
      const guildId = interaction.guildId ?? interaction.guild?.id;
      if (!guildId) {
        await interaction.respond([]).catch(() => {});
        return;
      }
      try {
        const list = await import('./api.js').then((m) => m.listEmbeds(guildId));
        const arr = Array.isArray(list) ? list : [];
        const focused = String(interaction.options.getFocused() ?? '').toLowerCase();
        const filtered = !focused
          ? arr
          : arr.filter((e) => (e.embed_name ?? '').toLowerCase().includes(focused));
        const choices = filtered.slice(0, 25).map((e) => ({
          name: (e.embed_name || e.embed_id || '').slice(0, 100),
          value: (useEmbedName ? e.embed_name || e.embed_id : e.embed_id || '').slice(0, 100),
        }));
        await interaction.respond(choices).catch(() => {});
      } catch (err) {
        await interaction.respond([]).catch(() => {});
      }
      return;
    }
  }
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId?.startsWith(EMBED_APPLY_SELECT_PREFIX)) {
      const embedId = interaction.customId.slice(EMBED_APPLY_SELECT_PREFIX.length);
      const selected = interaction.values ?? [];
      const guildId = interaction.guildId ?? interaction.guild?.id;
      try {
        await interaction.deferUpdate();
        if (guildId) {
          const types = ['Greeting', 'Leaving', 'Boosting', 'Leveling', 'Logging'];
          for (const type of types) {
            await api.setMessageEmbed(guildId, type, selected.includes(type) ? embedId : null);
          }
        }
        await interaction.editReply({
          content: formatEphemeralContent('Message embed updated.'),
          components: [],
        }).catch(() => {});
      } catch (err) {
        console.error('[InteractionCreate] EmbedApply select:', err);
        await interaction.editReply({
          content: formatEphemeralContent('Update failed.'),
          components: [],
        }).catch(() => {});
      }
      return;
    }
    if (isServerStatsSelectId(interaction.customId)) {
      try {
        await interaction.deferUpdate();
        const values = interaction.values ?? [];
        const channelsIdx = values.length > 0 ? parseInt(values.join(''), 10) : 0;
        await doSetServerStats(interaction, channelsIdx);
      } catch (err) {
        console.error('[InteractionCreate] ServerStats select:', err);
        if (!interaction.deferred) await interaction.reply({ content: 'Error.', flags: MessageFlags.Ephemeral }).catch(() => {});
        else await interaction.editReply({ content: 'Error.', components: [] }).catch(() => {});
      }
      return;
    }
    if (interaction.customId?.startsWith(ACTION_SELECT_PREFIX)) {
      const selectedScript = interaction.values?.[0];
      if (!selectedScript) return;
      if (!SCRIPTS_NEED_MODAL.has(selectedScript)) {
        try {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch (err) {
          if (isUnknownInteraction(err)) {
            console.warn('[InteractionCreate] Select defer 10062 - try again.');
            return;
          }
          throw err;
        }
      }
      try {
        await handleAction(interaction, client);
      } catch (err) {
        console.error('[InteractionCreate] Action select:', err);
      }
      return;
    }
  }
  if (interaction.isButton()) {
    const needsModal = isButtonModalScript(interaction.customId);
    if (!needsModal) {
      try {
        if (isButtonDeferUpdate(interaction.customId)) {
          await interaction.deferUpdate();
        } else {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        }
      } catch (err) {
        if (isUnknownInteraction(err)) {
          console.warn('[InteractionCreate] Button defer 10062 - token expired, click the button again.');
          return;
        }
        throw err;
      }
    }
    const id = interaction.id;
    if (pendingButtonIds.has(id)) return;
    pendingButtonIds.add(id);
    const receivedAt = Date.now();
    const interactionAge = interaction.createdTimestamp ? receivedAt - interaction.createdTimestamp : 0;
    try {
      const handled = await handleAction(interaction, client, { receivedAt, interactionAge });
      if (handled) return;
    } finally {
      pendingButtonIds.delete(id);
    }
  }
  if (interaction.isModalSubmit()) {
    const parsed = parseModalCustomId(interaction.customId);
    if (parsed) {
      const { scriptName, targetId } = parsed;
      const inputIds = getModalInputIds(scriptName);
      const modalValues = {};
      for (const id of inputIds) {
        const value = interaction.fields.getTextInputValue(id);
        modalValues[id] = value?.trim() || null;
      }
      const isEmbedEditModal =
        ['EmbedEditBasic', 'EmbedEditAuthor', 'EmbedEditFooter', 'EmbedEditImages', 'EmbedRename'].includes(scriptName);
      const isEmbedDeleteModal = scriptName === 'EmbedDelete';
      try {
        if (isEmbedEditModal) {
          await interaction.deferUpdate();
        } else if (isEmbedDeleteModal) {
          if (interaction.message) await interaction.deferUpdate();
          else await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } else {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        }
        const actionContext = { targetId, modalValues };
        await runScript(scriptName, interaction, client, actionContext);
        const payload =
          !isEmbedEditModal && !isEmbedDeleteModal
            ? await getEmbedUpdatePayload(scriptName, interaction, actionContext)
            : null;
        if (interaction.message) {
          if (payload) {
            await interaction.message.edit(payload).catch(() => {});
          } else if (!isEmbedEditModal && !isEmbedDeleteModal) {
            const componentsOnly = resetComponentsOnly(scriptName, interaction, actionContext);
            if (componentsOnly) {
              await interaction.message.edit({ components: componentsOnly }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error('[ModalSubmit]', err);
        if (isUnknownInteraction(err)) return;
        const content = formatEphemeralContent('Something went wrong.');
        if ((isEmbedEditModal || isEmbedDeleteModal) && interaction.deferred) {
          await interaction.followUp({ content, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else if (interaction.deferred) {
          await interaction.editReply({ content }).catch(() => {});
        } else {
          await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
      }
    }
    return;
  }
  if (interaction.isChatInputCommand()) {
    const scriptName = getScriptNameByCommand(interaction.commandName);
    const slashUsesEmbed = scriptName && EMBED_BY_SCRIPT[scriptName]?.replyType === 'embed';
    try {
      await interaction.deferReply({ flags: slashUsesEmbed ? 0 : MessageFlags.Ephemeral });
    } catch (err) {
      if (isUnknownInteraction(err)) {
        console.warn('[InteractionCreate] Token expired (10062) - try the command again in a few seconds.');
        return;
      }
      throw err;
    }
    if (!scriptName) {
      await interaction.editReply({ content: 'Unknown command.' }).catch(() => {});
      return;
    }
    const handled = await handleSlash(interaction, client);
    if (handled) return;
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN in .env');
  process.exit(1);
}

client.on(Events.MessageCreate, (message) => {
  onMessageCreate(message).catch((err) => {
    console.warn('[Leveling]', err?.message ?? err);
  });
});

(async () => {
  await loadAllScripts();
  client.login(token);
})();
