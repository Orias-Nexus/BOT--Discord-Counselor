/**
 * Run script by name. Uses preloaded cache to avoid Unknown interaction (reply/defer within 3s).
 */
import { MessageFlags } from 'discord.js';
import { formatEphemeralContent } from '../api.js';

const SCRIPT_NAMES = [
  'ServerInfo', 'StatusTimeout', 'StatusRole', 'StatusUnrole', 'SetVoiceCreator', 'SetServerStats',
  'CategoryInfo', 'CategoryClone', 'CategoryPrivate', 'CategoryPublic',
  'ChannelInfo', 'ChannelClone', 'ChannelCreate', 'ChannelSync', 'ChannelPrivate', 'ChannelPublic', 'ChannelSFW', 'ChannelNSFW',
  'ChannelSlow', 'ChannelUnslow', 'ChannelBitrate', 'ChannelLimit',
  'MemberInfo', 'MemberRename', 'MemberSetlevel', 'MemberMove', 'MemberReset', 'MemberWarn', 'MemberMute', 'MemberLock', 'MemberKick',
  'MemberGreeting', 'MemberLeaving', 'MemberBoosting', 'MemberLeveling', 'MemberLogging',
  'GreetingChannel', 'LeavingChannel', 'BoostingChannel', 'LevelingChannel', 'LoggingChannel',
  'GreetingMessage', 'LeavingMessage', 'BoostingMessage', 'LevelingMessage', 'LoggingMessage',
  'GreetingTest', 'LeavingTest', 'BoostingTest', 'LevelingTest', 'LoggingTest',
  'EmbedCreate', 'EmbedEdit', 'EmbedRename', 'EmbedDelete', 'EmbedApply',
  'EmbedEditBasic', 'EmbedEditAuthor', 'EmbedEditFooter', 'EmbedEditImages',
  'MessageSend', 'MessageDele',
  'LevelLocal', 'LevelGlobal', 'TopLocal', 'TopGlobal',
];

const scriptCache = new Map();

/** Script name (PascalCase) → file name (camelCase). */
function scriptNameToFileName(name) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

export async function loadAllScripts() {
  for (const name of SCRIPT_NAMES) {
    try {
      const fileName = scriptNameToFileName(name);
      const module = await import(`./${fileName}.js`);
      scriptCache.set(name, module);
    } catch (err) {
      console.warn(`[runScript] Failed to load script: ${name}`, err.message);
    }
  }
}

export async function runScript(scriptName, interaction, client) {
  if (!scriptName || typeof scriptName !== 'string') {
    await replyError(interaction, 'Invalid script name.');
    return;
  }

  const module = scriptCache.get(scriptName);
  if (!module) {
    await replyError(interaction, `Script not found: ${scriptName}`);
    return;
  }

  const run = module.run ?? module.default?.run ?? module.default;
  if (typeof run !== 'function') {
    await replyError(interaction, `Script "${scriptName}" does not export run.`);
    return;
  }

  const actionContext = arguments[3] ?? null;
  const result = await run(interaction, client, actionContext);
  return result;
}

/**
 * Run script from event (no interaction). eventContext: { guild, member } or equivalent.
 */
export async function runEvent(scriptName, client, eventContext) {
  if (!scriptName || typeof scriptName !== 'string') return;
  const module = scriptCache.get(scriptName);
  if (!module) return;
  const run = module.run ?? module.default?.run ?? module.default;
  if (typeof run !== 'function') return;
  await run(null, client, eventContext);
}

async function replyError(interaction, message) {
  const payload = { content: formatEphemeralContent(message), flags: MessageFlags.Ephemeral };
  if (interaction.deferred) {
    await interaction.editReply(payload).catch(() => {});
  } else if (interaction.replied) {
    await interaction.followUp(payload).catch(() => {});
  } else {
    await interaction.reply(payload).catch(() => {});
  }
}
