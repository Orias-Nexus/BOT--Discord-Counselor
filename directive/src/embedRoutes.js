/**
 * Route embed: script -> replyType (embed/ephemeral) và builder (hàm build embed).
 */

import { getServerInfoEmbed } from './embeds/serverInfo.js';
import { getCategoryInfoEmbed } from './embeds/categoryInfo.js';
import { getChannelInfoEmbed } from './embeds/channelInfo.js';
import { getMemberInfoEmbed } from './embeds/memberInfo.js';
import { getResolvedEmbedForDisplay } from './embeds/embedTemplate.js';

/** script name -> { replyType: 'embed', builder? } */
export const EMBED_BY_SCRIPT = {
  ServerInfo: { replyType: 'embed', builder: 'serverInfoEmbed.buildEmbed' },
  CategoryInfo: { replyType: 'embed', builder: 'categoryInfoEmbed.buildCategoryEmbed' },
  ChanelInfo: { replyType: 'embed', builder: 'channelInfoEmbed.buildChannelEmbed' },
  MemberInfo: { replyType: 'embed', builder: 'memberInfoEmbed.buildEmbed' },
  EmbedCreate: { replyType: 'embed', builder: 'embedTemplate.getResolvedEmbedForDisplay' },
  EmbedEdit: { replyType: 'embed', builder: 'embedTemplate.getResolvedEmbedForDisplay' },
};

/** builder key -> hàm build embed */
const EMBED_BUILDER_FNS = {
  'serverInfoEmbed.buildEmbed': getServerInfoEmbed,
  'categoryInfoEmbed.buildCategoryEmbed': getCategoryInfoEmbed,
  'channelInfoEmbed.buildChannelEmbed': getChannelInfoEmbed,
  'memberInfoEmbed.buildEmbed': getMemberInfoEmbed,
  'embedTemplate.getResolvedEmbedForDisplay': getResolvedEmbedForDisplay,
};

/**
 * Lấy hàm build embed theo script (để script gọi thay vì import trực tiếp).
 * @param {string} scriptName
 * @returns {((...args: unknown[]) => Promise<object>)|null}
 */
export function getEmbedBuilder(scriptName) {
  const key = EMBED_BY_SCRIPT[scriptName]?.builder;
  return (key && EMBED_BUILDER_FNS[key]) || null;
}
