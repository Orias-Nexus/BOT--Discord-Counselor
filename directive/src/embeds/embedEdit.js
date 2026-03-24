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
  const row = await api.getEmbed(guildId, embedId);
  if (!row?.embed) throw new Error('Embed not found');
  const merged = mergeFn(typeof row.embed === 'object' ? { ...row.embed } : {});
  await api.updateEmbed(guildId, embedId, { embed: merged });
  const updated = await api.getEmbed(guildId, embedId);
  if (updated) {
    setEmbedEditCache(guildId, embedId, {
      embed: updated.embed ?? merged,
      embed_name: updated.embed_name ?? null,
    });
  }
  const buildEmbed = getEmbedBuilder('EmbedEdit');
  if (!buildEmbed) throw new Error('Embed builder not found');
  const resolved = await buildEmbed(updated?.embed ?? merged, meta);
  return { resolved, components: buildEmbedEditComponents(embedId) };
}
