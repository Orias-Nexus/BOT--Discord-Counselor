/**
 * @fileoverview ExecutionContext for Custom Command Engine.
 * Holds Discord source (Message/Interaction), routing flags, action queue, and runtime state.
 */

/**
 * @typedef {import('discord.js').Message} Message
 * @typedef {import('discord.js').MessageContextMenuCommandInteraction|import('discord.js').ChatInputCommandInteraction|import('discord.js').MessageComponentInteraction} Interaction
 */

/**
 * One deferred task to run after the reply is sent (Phase 3 actions).
 * @typedef {object} ActionTask
 * @property {string} type - Tag name (e.g. 'addrole', 'react')
 * @property {string} [argument] - Raw argument string
 * @property {string} [fullMatch] - Original tag string for stripping
 */

/**
 * ExecutionContext — immutable snapshot of the command invocation and mutable routing/queue state.
 * @typedef {object} ExecutionContext
 * @property {Message|null} message - Discord Message (if triggered by message)
 * @property {Interaction|null} interaction - Discord Interaction (if triggered by slash/button)
 * @property {boolean} isDM - If true, reply should go to user DMs
 * @property {string|null} targetChannelId - If set, reply should go to this channel ID
 * @property {string|null} embedId - If set, load embed template from DB by this ID
 * @property {boolean} silent - If true, send as ephemeral / suppress notifications
 * @property {boolean} deleteCommand - If true, delete the invoker's message
 * @property {number|null} deleteReplyAfter - If set, delete bot reply after N seconds
 * @property {ActionTask[]} actionQueue - Tasks to run after message is sent
 * @property {Record<string, string>} placeholderCache - e.g. { choice: 'táo', lockedchoice: '...', '$1': 'arg1' }
 * @property {string[]} userArgs - Parsed arguments from user input (for [$1], [$2])
 * @property {object} [meta] - Optional extra (guild, member, user, channel) for handler convenience
 */

/**
 * Creates a new ExecutionContext from a Discord Message or Interaction.
 * @param {{ message?: Message|null, interaction?: Interaction|null }} source
 * @returns {ExecutionContext}
 */
export function createContext(source) {
  const message = source.message ?? null;
  const interaction = source.interaction ?? null;
  const author = message?.author ?? interaction?.user ?? null;
  const guild = message?.guild ?? interaction?.guild ?? null;
  const channel = message?.channel ?? interaction?.channel ?? null;
  const member = message?.member ?? interaction?.member ?? null;

  return {
    message,
    interaction,
    isDM: false,
    targetChannelId: null,
    embedId: null,
    silent: false,
    deleteCommand: false,
    deleteReplyAfter: null,
    actionQueue: [],
    placeholderCache: {},
    userArgs: [],
    meta: {
      author,
      guild,
      channel,
      member,
      user: author,
    },
  };
}

/**
 * Tạo ExecutionContext từ meta (member, guild, channel) khi không có message/interaction.
 * Dùng cho embeds, script build nội dung từ Discord object.
 * @param {{ member?: import('discord.js').GuildMember|null, guild?: import('discord.js').Guild|null, channel?: import('discord.js').Channel|null }} meta
 * @returns {ExecutionContext}
 */
export function createContextFromMeta(meta = {}) {
  const member = meta.member ?? null;
  const guild = meta.guild ?? member?.guild ?? null;
  const channel = meta.channel ?? null;
  const user = meta.user ?? member?.user ?? null;
  return {
    message: null,
    interaction: null,
    isDM: false,
    targetChannelId: null,
    embedId: null,
    silent: false,
    deleteCommand: false,
    deleteReplyAfter: null,
    actionQueue: [],
    placeholderCache: { ...meta.placeholderCache },
    userArgs: [],
    meta: {
      author: user,
      guild,
      channel,
      member,
      user,
      memberProfile: meta.memberProfile ?? null,
      memberRank: meta.memberRank ?? null,
      userProfile: meta.userProfile ?? null,
      userRank: meta.userRank ?? null,
    },
  };
}

/**
 * Clone context for immutable updates (e.g. set isDM without mutating original).
 * @param {ExecutionContext} ctx
 * @returns {ExecutionContext}
 */
export function cloneContext(ctx) {
  return {
    ...ctx,
    actionQueue: [...ctx.actionQueue],
    placeholderCache: { ...ctx.placeholderCache },
    userArgs: [...ctx.userArgs],
    meta: { ...ctx.meta },
  };
}
