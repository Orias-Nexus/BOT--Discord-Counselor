import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import * as api from '../api.js';
import { getEmbedBuilder } from '../embedRoutes.js';
import { ACTION_PREFIX } from '../utils/components.js';

export const EMBED_APPLY_SELECT_PREFIX = 'embedapply_';

/** Returns 2 rows: [Edit row (4 buttons), Rename + Delete + Apply row]. */
export function buildEmbedEditRow(embedId) {
  const rowEdit = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`${ACTION_PREFIX}EmbedEditBasic_${embedId}`).setLabel('Edit Basic Info').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${ACTION_PREFIX}EmbedEditAuthor_${embedId}`).setLabel('Edit Author').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${ACTION_PREFIX}EmbedEditFooter_${embedId}`).setLabel('Edit Footer').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${ACTION_PREFIX}EmbedEditImages_${embedId}`).setLabel('Edit Images').setStyle(ButtonStyle.Secondary)
  );
  const rowActions = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`${ACTION_PREFIX}EmbedRename_${embedId}`).setLabel('Embed Rename').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`${ACTION_PREFIX}EmbedDelete_${embedId}`).setLabel('Embed Delete').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`${ACTION_PREFIX}EmbedApply_${embedId}`).setLabel('Apply').setStyle(ButtonStyle.Primary)
  );
  return [rowEdit, rowActions];
}

function parseColor(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  const n = parseInt(s, 10);
  if (!Number.isNaN(n) && n >= 0 && n <= 0xffffff) return n;
  return null;
}

/**
 * Get embed from API, merge updates, call updateEmbed, return resolved embed + row.
 * @param {string} guildId
 * @param {string} embedId
 * @param {(embed: object) => object} mergeFn - Receives current embed, returns merged embed (may mutate)
 * @param {{ member?, guild?, channel? }} meta
 * @returns {Promise<{ resolved: object, row: ActionRowBuilder }>}
 */
export async function updateEmbedAndResolve(guildId, embedId, mergeFn, meta) {
  const row = await api.getEmbed(guildId, embedId);
  if (!row?.embed) throw new Error('Embed not found');
  const merged = mergeFn(typeof row.embed === 'object' ? { ...row.embed } : {});
  await api.updateEmbed(guildId, embedId, { embed: merged });
  const updated = await api.getEmbed(guildId, embedId);
  const buildEmbed = getEmbedBuilder('EmbedEdit');
  if (!buildEmbed) throw new Error('Embed builder not found');
  const resolved = await buildEmbed(updated?.embed ?? merged, meta);
  return { resolved, row: buildEmbedEditRow(embedId) };
}

/** Parse fields: user enters content inside [ ]; code wraps in [ ] before parse. */
function parseFields(value) {
  const s = value != null ? String(value).trim() : '';
  const wrapped = s === '' ? '[]' : `[${s}]`;
  try {
    const arr = JSON.parse(wrapped);
    if (!Array.isArray(arr)) return null;
    return arr
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        name: String(item.name ?? '').slice(0, 256),
        value: String(item.value ?? '').slice(0, 1024),
        inline: Boolean(item.inline),
      }));
  } catch {
    return null;
  }
}

export function mergeBasic(embed, modalValues) {
  if (modalValues.title !== undefined) embed.title = modalValues.title || null;
  if (modalValues.description !== undefined) embed.description = modalValues.description || null;
  const color = parseColor(modalValues.color);
  if (color !== null) embed.color = color;
  const fields = parseFields(modalValues.fields);
  if (fields !== null) embed.fields = fields;
  return embed;
}

export function mergeAuthor(embed, modalValues) {
  const name = modalValues.author_name ?? embed.author?.name ?? null;
  const icon_url = modalValues.author_icon_url ?? embed.author?.icon_url ?? null;
  if (name || icon_url) embed.author = { name: name || null, icon_url: icon_url || null };
  return embed;
}

export function mergeFooter(embed, modalValues) {
  const text = modalValues.footer_text ?? embed.footer?.text ?? null;
  const icon_url = modalValues.footer_icon_url ?? embed.footer?.icon_url ?? null;
  if (text || icon_url) embed.footer = { text: text || null, icon_url: icon_url || null };
  return embed;
}

export function mergeImages(embed, modalValues) {
  if (modalValues.thumbnail_url !== undefined) {
    embed.thumbnail = modalValues.thumbnail_url ? { url: modalValues.thumbnail_url } : null;
  }
  if (modalValues.image_url !== undefined) {
    embed.image = modalValues.image_url ? { url: modalValues.image_url } : null;
  }
  return embed;
}
