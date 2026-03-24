/** In-memory cache so EmbedEdit modals open without waiting on getEmbed (avoids interaction 10062). */

const TTL_MS = 15 * 60 * 1000;
/** @type {Map<string, { data: { embed: object, embed_name: string | null }, expires: number }>} */
const cache = new Map();

function key(guildId, embedId) {
  return `${guildId}:${embedId}`;
}

/**
 * @param {string} guildId
 * @param {string} embedId
 * @param {{ embed: object, embed_name?: string | null }} row
 */
export function setEmbedEditCache(guildId, embedId, row) {
  if (!guildId || !embedId || !row?.embed) return;
  cache.set(key(guildId, embedId), {
    data: { embed: row.embed, embed_name: row.embed_name ?? null },
    expires: Date.now() + TTL_MS,
  });
}

/**
 * @param {string} guildId
 * @param {string} embedId
 * @returns {{ embed: object, embed_name: string | null } | null}
 */
export function getEmbedEditCache(guildId, embedId) {
  if (!guildId || !embedId) return null;
  const entry = cache.get(key(guildId, embedId));
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key(guildId, embedId));
    return null;
  }
  return entry.data;
}

export function deleteEmbedEditCache(guildId, embedId) {
  if (!guildId || !embedId) return;
  cache.delete(key(guildId, embedId));
}
