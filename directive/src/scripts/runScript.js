/**
 * Chạy script theo tên. Dùng cache đã preload để tránh Unknown interaction (phải reply/defer trong 3s).
 */
import { MessageFlags } from 'discord.js';
import { formatEphemeralContent } from '../api.js';

const SCRIPT_NAMES = [
  'ServerInfo', 'StatusTimeout', 'StatusRole', 'StatusUnrole',
  'CategoryInfo', 'CategoryClone', 'CategoryPrivate', 'CategoryPublic',
  'ChanelInfo', 'ChannelClone', 'ChannelSync', 'ChannelPrivate', 'ChannelPublic', 'ChannelSFW', 'ChannelNSFW',
  'MemberInfo', 'MemberRename', 'MemberSetlevel', 'MemberMove', 'MemberReset', 'MemberWarn', 'MemberMute', 'MemberLock', 'MemberKick',
];

const scriptCache = new Map();

export async function loadAllScripts() {
  for (const name of SCRIPT_NAMES) {
    try {
      const module = await import(`./${name}.js`);
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
  await run(interaction, client, actionContext);
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
