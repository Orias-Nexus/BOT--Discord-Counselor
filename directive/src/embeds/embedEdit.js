import * as api from '../api.js';
import { getEmbedBuilder } from '../embedRoutes.js';
import { buildEmbedEditComponents } from '../utils/components.js';
import { setEmbedEditCache } from '../utils/embedEditCache.js';

export const EMBED_APPLY_SELECT_PREFIX = 'embedapply_';

/**
 * Get embed from API, merge updates, call updateEmbed, return resolved embed + components.
 * @param {string} guildId
 * @param {string} embedId
 * @param {(embed: object) => object} mergeFn - Receives current embed, returns merged embed (may mutate)
 * @param {{ member?, guild?, channel? }} meta
 * @returns {Promise<{ resolved: object, row: ActionRowBuilder[] }>}
 */
export async function updateEmbedAndResolve(guildId, embedId, mergeFn, meta) {
  let currentEmbed = {};
  const cached = getEmbedEditCache(guildId, embedId);
  if (cached && cached.embed) {
    currentEmbed = cached.embed;
  } else {
    const row = await api.getEmbed(guildId, embedId);
    if (!row?.embed) throw new Error('Embed not found');
    currentEmbed = row.embed;
  }

  const merged = mergeFn(typeof currentEmbed === 'object' ? { ...currentEmbed } : {});

  // Fast UI response: update cache locally and return immediately
  setEmbedEditCache(guildId, embedId, {
    embed: merged,
    embed_name: cached?.embed_name ?? null,
  });

  // Background update directly to API
  api.updateEmbed(guildId, embedId, { embed: merged }).catch((err) => console.error('[EmbedUpdateBackground]', err));

  const buildEmbed = getEmbedBuilder('EmbedEdit');
  if (!buildEmbed) throw new Error('Embed builder not found');
  const resolved = await buildEmbed(merged, meta);
  return { resolved, components: buildEmbedEditComponents(embedId) };
}
