/**
 * Helper dùng parser (customs) cho embeds: singleton parser + tạo context từ member/guild/channel.
 */
import { createParser, resolveEmbedPlaceholders, createContextFromMeta } from '../customs/index.js';
import { omitNull } from './schema.js';

let parserInstance = null;

/**
 * Parser singleton (chỉ Phase 4 placeholders) để resolve {user_name}, {server_icon}, ...
 * @returns {import('../customs/commandParser.js').CommandParser}
 */
export function getEmbedParser() {
  if (!parserInstance) parserInstance = createParser();
  return parserInstance;
}

/**
 * Tạo context từ Discord objects (không cần message/interaction).
 * @param {{ member?: import('discord.js').GuildMember|null, guild?: import('discord.js').Guild|null, channel?: import('discord.js').Channel|null, placeholderCache?: Record<string, string> }} meta
 * @returns {import('../customs/executionContext.js').ExecutionContext}
 */
export function createEmbedContext(meta = {}) {
  return createContextFromMeta(meta);
}

/**
 * Resolve mọi placeholder trong embed object (đệ quy mọi string).
 * @param {object} embedData - Plain embed object có thể chứa '{user_avatar}', '{server_name}', ...
 * @param {{ member?: import('discord.js').GuildMember|null, guild?: import('discord.js').Guild|null, channel?: import('discord.js').Channel|null, placeholderCache?: Record<string, string> }} meta
 * @returns {Promise<object>}
 */
export async function resolveEmbed(embedData, meta = {}) {
  const parser = getEmbedParser();
  const ctx = createEmbedContext(meta);
  return resolveEmbedPlaceholders(embedData, parser, ctx);
}

/**
 * Resolve placeholder trong một chuỗi (vd: "Completed Set {channel_name} as Greeting Channel").
 * @param {string} str
 * @param {{ member?: import('discord.js').GuildMember|null, guild?: import('discord.js').Guild|null, channel?: import('discord.js').Channel|null, placeholderCache?: Record<string, string> }} meta
 * @returns {Promise<string>}
 */
export async function resolveString(str, meta = {}) {
  if (typeof str !== 'string') return String(str ?? '');
  const parser = getEmbedParser();
  const ctx = createEmbedContext(meta);
  return parser.compilePhase4Only(str, ctx);
}

/**
 * Trả về embed đã resolve placeholders qua parser (để gửi lên Discord).
 * @param {object} embedData - Embed object (có thể từ DB)
 * @param {{ member?: import('discord.js').GuildMember|null, guild?: import('discord.js').Guild|null, channel?: import('discord.js').Channel|null, placeholderCache?: Record<string, string> }} meta
 * @returns {Promise<object>}
 */
export async function getResolvedEmbedForDisplay(embedData, meta = {}) {
  const resolved = await resolveEmbed(embedData ?? {}, meta);
  return omitNull(resolved);
}
