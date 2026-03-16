/**
 * Custom Command Engine — Parser, ExecutionContext, and handler factory.
 * Load variables.json, register handlers, compile raw strings and run the 4-phase pipeline.
 *
 * @example
 * // Create parser (loads variables.json from cwd)
 * const parser = createParser('variables.json');
 *
 * // Or with custom registry and inject your handlers
 * const registry = createHandlerRegistry({ withExamples: false });
 * registerHandler(registry, 'requireperm', myRequirePermHandler);
 * registerHandler(registry, 'addrole', myAddRoleHandler);
 * registerHandler(registry, 'user', myUserPlaceholder);
 * const parser = createParser('variables.json', registry);
 *
 * // Compile a raw string (e.g. from DB) with Message or Interaction
 * const result = await compile(parser, rawString, { message: discordMessage });
 * if (!result.success) return reply(result.error);
 * await channel.send(result.output);
 * await executeActionQueue(result.context, { addrole: (member, roleId) => member.roles.add(roleId) });
 */

import { readFileSync } from 'fs';
import { dirname, resolve, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { createContext, cloneContext, createContextFromMeta } from './executionContext.js';
import { CommandParser, flattenTagConfig } from './commandParser.js';
import { registerAll } from './handlers/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
/** variables.json ở repo root; resolve theo vị trí module để chạy được từ directive/ hoặc repo root. */
const DEFAULT_CONFIG_PATH = resolve(__dirname, '../../../variables.json');

/**
 * Build a handler registry and optionally register all handlers from placeholders, advanced_logic, modifiers, guards, actions.
 * @param {object} [options]
 * @param {boolean} [options.withAll=true] - Register tất cả handler (từ variables.json)
 * @returns {Map<string, (ctx: import('./executionContext.js').ExecutionContext, argument?: string) => Promise<boolean|string|void>|boolean|string|void>}
 */
export function createHandlerRegistry(options = {}) {
  const { withAll = true } = options;
  const registry = new Map();
  if (withAll) registerAll(registry);
  return registry;
}

/**
 * Register a single handler for a tag (e.g. bind your own logic without editing core).
 * @param {Map<string, Function>} registry
 * @param {string} tagName
 * @param {(ctx: import('./executionContext.js').ExecutionContext, argument?: string) => Promise<boolean|string|void>|boolean|string|void} handler
 */
export function registerHandler(registry, tagName, handler) {
  registry.set(tagName, handler);
}

/**
 * Create CommandParser from config path and handler registry.
 * @param {string} [configPath=DEFAULT_CONFIG_PATH] - Path tuyệt đối hoặc tương đối repo root
 * @param {Map<string, Function>} [registry] - If omitted, uses createHandlerRegistry()
 * @returns {CommandParser}
 */
export function createParser(configPath = DEFAULT_CONFIG_PATH, registry = null) {
  const configBase = dirname(DEFAULT_CONFIG_PATH);
  const fullPath = isAbsolute(configPath) ? configPath : resolve(configBase, configPath);
  const config = JSON.parse(readFileSync(fullPath, 'utf8'));
  const tagConfig = flattenTagConfig(config);
  const handlers = registry ?? createHandlerRegistry();
  return new CommandParser(tagConfig, handlers);
}

/**
 * Run the full pipeline and return result. Convenience for Message or Interaction.
 * @param {CommandParser} parser
 * @param {string} raw
 * @param {{ message?: import('discord.js').Message|null, interaction?: import('discord.js').Interaction|null }} source
 * @param {{ userArgs?: string[] }} [options] - Optional user arguments for [$1], [$2]
 * @returns {Promise<{ success: boolean, output: string, context: import('./executionContext.js').ExecutionContext, error?: string }>}
 */
export async function compile(parser, raw, source, options = {}) {
  const ctx = createContext(source);
  if (options.userArgs && Array.isArray(options.userArgs)) {
    ctx.userArgs = options.userArgs;
  }
  return parser.compile(raw, ctx);
}

/**
 * Thực thi actionQueue sau khi đã gửi reply (addrole, removerole, setnick, react, …).
 * Gọi sau khi đã send message. Truyền cùng context từ kết quả compile().
 * @param {import('./executionContext.js').ExecutionContext} context
 * @param {object} implementations - Discord/backend API bindings
 * @param {(member, roleId: string) => Promise<void>} [implementations.addrole]
 * @param {(member, roleId: string) => Promise<void>} [implementations.removerole]
 * @param {(member, nick: string) => Promise<void>} [implementations.setnick]
 * @param {(messageOrReply, emoji: string) => Promise<void>} [implementations.react]
 * @param {(messageOrReply, emoji: string) => Promise<void>} [implementations.reactreply]
 * @param {(userId: string, guildId: string, delta: number) => Promise<void>} [implementations.modifybal]
 * @param {(userId: string, guildId: string, itemId: string, delta: number) => Promise<void>} [implementations.modifyinv]
 * @param {(replyOrChannel, label: string, customId: string) => Promise<void>} [implementations.addbutton]
 * @param {(replyOrChannel, label: string, url: string) => Promise<void>} [implementations.addlinkbutton]
 */
export async function executeActionQueue(context, implementations = {}) {
  const member = context.meta?.member ?? null;
  const message = context.meta?.message ?? null;
  const userId = context.meta?.user?.id ?? null;
  const guildId = context.meta?.guild?.id ?? null;

  for (const task of context.actionQueue) {
    try {
      if (task.type === 'addrole' && implementations.addrole && member) {
        await implementations.addrole(member, task.argument);
      } else if (task.type === 'removerole' && implementations.removerole && member) {
        await implementations.removerole(member, task.argument);
      } else if (task.type === 'setnick' && implementations.setnick && member) {
        await implementations.setnick(member, task.argument ?? '');
      } else if (task.type === 'react' && implementations.react && message) {
        await implementations.react(message, task.argument ?? '');
      } else if (task.type === 'reactreply' && implementations.reactreply && message) {
        await implementations.reactreply(message, task.argument ?? '');
      } else if (task.type === 'modifybal' && implementations.modifybal && userId && guildId) {
        const [deltaStr] = String(task.argument ?? '0').split(/\s/);
        await implementations.modifybal(userId, guildId, Number(deltaStr) || 0);
      } else if (task.type === 'modifyinv' && implementations.modifyinv && userId && guildId) {
        const parts = String(task.argument ?? '').trim().split(/\s+/);
        const [itemId, deltaStr] = parts;
        await implementations.modifyinv(userId, guildId, itemId ?? '', Number(deltaStr) || 0);
      } else if (task.type === 'addbutton' && implementations.addbutton) {
        const target = message ?? context.meta?.channel;
        if (target) {
          const [label, customId] = String(task.argument ?? '').split('|').map((s) => s.trim());
          await implementations.addbutton(target, label ?? 'Button', customId ?? 'btn');
        }
      } else if (task.type === 'addlinkbutton' && implementations.addlinkbutton) {
        const target = message ?? context.meta?.channel;
        if (target) {
          const [label, url] = String(task.argument ?? '').split('|').map((s) => s.trim());
          await implementations.addlinkbutton(target, label ?? 'Link', url ?? '');
        }
      }
    } catch (err) {
      if (typeof implementations.onActionError === 'function') {
        implementations.onActionError(task, err);
      }
    }
  }
}

/**
 * Resolve mọi placeholder (Phase 4) trong embed object — dùng khi embed lưu chuỗi kiểu thumbnail.url: '{user_avatar}'.
 * Đệ quy duyệt mọi string trong object và thay {user_avatar}, {user_name}, ... theo context.
 * @param {object} embedData - Embed plain object (có thể chứa chuỗi '{user_avatar}', '{user_name}', ...)
 * @param {CommandParser} parser
 * @param {import('./executionContext.js').ExecutionContext} ctx - Context (meta.user = user cần lấy avatar, v.v.)
 * @returns {Promise<object>}
 */
export async function resolveEmbedPlaceholders(embedData, parser, ctx) {
  if (embedData === null || embedData === undefined) return embedData;
  if (typeof embedData === 'string') {
    return parser.compilePhase4Only(embedData, ctx);
  }
  if (Array.isArray(embedData)) {
    return Promise.all(embedData.map((item) => resolveEmbedPlaceholders(item, parser, ctx)));
  }
  if (typeof embedData === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(embedData)) {
      out[key] = await resolveEmbedPlaceholders(value, parser, ctx);
    }
    return out;
  }
  return embedData;
}

export { createContext, cloneContext, createContextFromMeta };
export { CommandParser, flattenTagConfig, extractCurlyTags, createParserFromConfig } from './commandParser.js';
