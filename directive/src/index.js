import 'dotenv/config';
import { Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { formatEphemeralContent, isUnknownInteraction } from './api.js';
import { getScriptNameByCommand } from './slashs/commands.js';
import { handleSlash } from './slashs/handleSlash.js';
import { handleAction, isButtonModalScript } from './actions/handleAction.js';
import { parseModalCustomId, getModalInputIds } from './actions/modalConfig.js';
import { getEmbedUpdatePayload } from './actions/embedUpdate.js';
import { runScript, runEvent, loadAllScripts } from './scripts/runScript.js';
import { startExpiresCheck } from './jobs/expiresCheck.js';
import { startStatsCheck } from './jobs/statsCheck.js';
import { EVENT_HANDLERS } from './events/eventRegistry.js';
import { isServerStatsSelectId, doSetServerStats } from './scripts/SetServerStats.js';

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
  startExpiresCheck(c);
  startStatsCheck(c);
});

for (const { discordEvent, scriptName, buildContext } of EVENT_HANDLERS) {
  const eventName = Events[discordEvent];
  if (!eventName) continue;
  client.on(eventName, async (...payload) => {
    try {
      const context = buildContext(...payload);
      await runEvent(scriptName, client, context);
    } catch (err) {
      console.warn(`[${discordEvent}] ${scriptName}:`, err?.message ?? err);
    }
  });
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isStringSelectMenu() && isServerStatsSelectId(interaction.customId)) {
    try {
      await interaction.deferUpdate();
      const values = interaction.values ?? [];
      const channelsIdx = values.length > 0 ? parseInt(values.join(''), 10) : 0;
      await doSetServerStats(interaction, channelsIdx);
    } catch (err) {
      console.error('[InteractionCreate] ServerStats select:', err);
      if (!interaction.deferred) await interaction.reply({ content: 'Có lỗi.', flags: MessageFlags.Ephemeral }).catch(() => {});
      else await interaction.editReply({ content: 'Có lỗi.', components: [] }).catch(() => {});
    }
    return;
  }
  if (interaction.isButton()) {
    const needsModal = isButtonModalScript(interaction.customId);
    if (!needsModal) {
      try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      } catch (err) {
        if (isUnknownInteraction(err)) {
          console.warn('[InteractionCreate] Button defer 10062 - token hết hạn, không gửi được phản hồi nên client sẽ kẹt "thinking..." đến khi timeout. Bấm lại nút.');
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
      try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const actionContext = { targetId, modalValues };
        await runScript(scriptName, interaction, client, actionContext);
        const payload = await getEmbedUpdatePayload(scriptName, interaction, actionContext);
        if (payload && interaction.message) {
          await interaction.message.edit(payload).catch(() => {});
        }
      } catch (err) {
        console.error('[ModalSubmit]', err);
        if (isUnknownInteraction(err)) return;
        const content = formatEphemeralContent('Có lỗi khi xử lý.');
        if (interaction.deferred) await interaction.editReply({ content }).catch(() => {});
        else await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => {});
      }
    }
    return;
  }
  if (interaction.isChatInputCommand()) {
    const scriptName = getScriptNameByCommand(interaction.commandName);
    const slashUsesEmbed =
      scriptName &&
      ['ServerInfo', 'MemberInfo', 'ChanelInfo', 'CategoryInfo'].includes(scriptName);
    try {
      await interaction.deferReply({ flags: slashUsesEmbed ? 0 : MessageFlags.Ephemeral });
    } catch (err) {
      if (isUnknownInteraction(err)) {
        console.warn('[InteractionCreate] Token hết hạn (10062) - thử lại lệnh sau vài giây.');
        return;
      }
      throw err;
    }
    if (!scriptName) {
      await interaction.editReply({ content: 'Lệnh không xác định.' }).catch(() => {});
      return;
    }
    const handled = await handleSlash(interaction, client);
    if (handled) return;
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Thiếu DISCORD_TOKEN trong .env');
  process.exit(1);
}

(async () => {
  await loadAllScripts();
  client.login(token);
})();
