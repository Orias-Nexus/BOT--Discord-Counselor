import { tryAwardExp } from './engine.js';
import * as api from '../api.js';
import { sendEventMessage } from '../eventMessages.js';

const COMMAND_PREFIXES = ['/', '!', '?', '.', '-', '$', '>', '~'];

function shouldIgnore(message) {
  if (message.author.bot) return true;
  if (message.webhookId) return true;
  if (!message.guild) return true;
  if (message.interaction) return true;
  const content = message.content?.trim();
  if (!content && message.attachments.size === 0) return true;
  if (content && COMMAND_PREFIXES.some((p) => content.startsWith(p))) return true;
  return false;
}

async function processLocal(guildId, userId, exp, message) {
  const result = await api.addLocalExp(guildId, userId, exp);
  if (!result) return;

  if (result.leveled_up) {
    const member = message.member ?? message.author;
    await sendEventMessage(message.guild, 'Leveling', { member, guild: message.guild }).catch(() => {});
  }
}

async function processGlobal(userId, exp) {
  await api.addGlobalExp(userId, exp);
}

/**
 * MessageCreate handler for the leveling system.
 * Runs local and global cooldown checks in parallel, then dispatches API calls.
 */
export async function onMessageCreate(message) {
  if (shouldIgnore(message)) return;

  const guildId = message.guild.id;
  const userId = message.author.id;

  try {
    const [localResult, globalResult] = await Promise.allSettled([
      tryAwardExp('local', guildId, userId),
      tryAwardExp('global', guildId, userId),
    ]);

    const localData = localResult.status === 'fulfilled' ? localResult.value : null;
    const globalData = globalResult.status === 'fulfilled' ? globalResult.value : null;

    const tasks = [];
    if (localData?.passed && localData.exp > 0) {
      tasks.push(processLocal(guildId, userId, localData.exp, message));
    }
    if (globalData?.passed && globalData.exp > 0) {
      tasks.push(processGlobal(userId, globalData.exp));
    }

    if (tasks.length > 0) await Promise.allSettled(tasks);
  } catch (err) {
    console.warn('[Leveling]', err?.message ?? err);
  }
}
