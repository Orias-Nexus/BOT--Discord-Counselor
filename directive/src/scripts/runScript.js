/**
 * Chạy script theo tên. Dùng cache đã preload để tránh Unknown interaction (phải reply/defer trong 3s).
 */
import { MessageFlags } from 'discord.js';
import { formatEphemeralContent } from '../api.js';

const SCRIPT_NAMES = [
  'ServerInfo', 'StatusTimeout', 'StatusRole', 'StatusUnrole', 'SetVoiceCreator', 'SetServerStats',
  'CategoryInfo', 'CategoryClone', 'CategoryPrivate', 'CategoryPublic',
  'ChanelInfo', 'ChannelClone', 'ChannelCreate', 'ChannelSync', 'ChannelPrivate', 'ChannelPublic', 'ChannelSFW', 'ChannelNSFW',
  'MemberInfo', 'MemberRename', 'MemberSetlevel', 'MemberMove', 'MemberReset', 'MemberWarn', 'MemberMute', 'MemberLock', 'MemberKick',
  'MemberGreeting', 'MemberLeaving', 'MemberBoosting',
  'GreetingChannel', 'LeavingChannel', 'BoostingChannel', 'GreetingMessage', 'LeavingMessage', 'BoostingMessage',
  'EmbedCreate', 'EmbedEdit', 'EmbedRename', 'EmbedDelete', 'EmbedApply',
  'EmbedEditBasic', 'EmbedEditAuthor', 'EmbedEditFooter', 'EmbedEditImages',
];

const scriptCache = new Map();

/** Tên script (PascalCase) -> tên file (camelCase). */
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
      console.warn(`[runScript] Không load được script: ${name}`, err.message);
    }
  }
}

export async function runScript(scriptName, interaction, client) {
  if (!scriptName || typeof scriptName !== 'string') {
    await replyError(interaction, 'Tên script không hợp lệ.');
    return;
  }

  const module = scriptCache.get(scriptName);
  if (!module) {
    await replyError(interaction, `Không tìm thấy script: ${scriptName}`);
    return;
  }

  const run = module.run ?? module.default?.run ?? module.default;
  if (typeof run !== 'function') {
    await replyError(interaction, `Script "${scriptName}" không export hàm run.`);
    return;
  }

  const actionContext = arguments[3] ?? null;
  const result = await run(interaction, client, actionContext);
  return result;
}

/**
 * Chạy script từ event (không có interaction). eventContext: { guild, member } hoặc tương đương.
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
