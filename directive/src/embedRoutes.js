/**
 * Embed route: script → replyType (embed/ephemeral) and builder (embed build fn).
 */

import { getServerInfoEmbed } from './embeds/ServerInfo.js';
import { getCategoryInfoEmbed } from './embeds/CategoryInfo.js';
import { getChannelInfoEmbed } from './embeds/ChannelInfo.js';
import { getMemberInfoEmbed } from './embeds/MemberInfo.js';
import { getResolvedEmbedForDisplay } from './embeds/.embedContext.js';

/** script name -> { replyType: 'embed', builder? } */
export const EMBED_BY_SCRIPT = {
  ServerInfo: { replyType: 'embed', builder: 'serverInfoEmbed.buildEmbed' },
  CategoryInfo: { replyType: 'embed', builder: 'categoryInfoEmbed.buildCategoryEmbed' },
  ChannelInfo: { replyType: 'embed', builder: 'channelInfoEmbed.buildChannelEmbed' },
  MemberInfo: { replyType: 'embed', builder: 'memberInfoEmbed.buildEmbed' },
  EmbedCreate: { replyType: 'embed', builder: 'embedContext.getResolvedEmbedForDisplay' },
  EmbedEdit: { replyType: 'embed', builder: 'embedContext.getResolvedEmbedForDisplay' },
};

/** builder key → embed build fn */
const EMBED_BUILDER_FNS = {
  'serverInfoEmbed.buildEmbed': getServerInfoEmbed,
  'categoryInfoEmbed.buildCategoryEmbed': getCategoryInfoEmbed,
  'channelInfoEmbed.buildChannelEmbed': getChannelInfoEmbed,
  'memberInfoEmbed.buildEmbed': getMemberInfoEmbed,
  'embedContext.getResolvedEmbedForDisplay': getResolvedEmbedForDisplay,
};

/**
 * Get embed builder fn by script (for scripts to call instead of direct import).
 * @param {string} scriptName
 * @returns {((...args: unknown[]) => Promise<object>)|null}
 */
export function getEmbedBuilder(scriptName) {
  const key = EMBED_BY_SCRIPT[scriptName]?.builder;
  return (key && EMBED_BUILDER_FNS[key]) || null;
}
