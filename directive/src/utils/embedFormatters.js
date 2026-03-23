export function parseColor(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return parseInt(s.slice(1), 16);
  if (/^[0-9a-fA-F]{6}$/.test(s)) return parseInt(s, 16);
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  const n = parseInt(s, 10);
  if (!Number.isNaN(n) && n >= 0 && n <= 0xffffff) return n;
  return null;
}

export function parseFields(value) {
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
  if (modalValues.color !== undefined) embed.color = parseColor(modalValues.color);
  const fields = parseFields(modalValues.fields);
  if (fields !== null) embed.fields = fields;
  return embed;
}

export function mergeAuthor(embed, modalValues) {
  const name = modalValues.author_name ?? embed.author?.name ?? null;
  const icon_url = modalValues.author_icon_url ?? embed.author?.icon_url ?? null;
  embed.author = (name || icon_url) ? { name: name || null, icon_url: icon_url || null } : null;
  return embed;
}

export function mergeFooter(embed, modalValues) {
  const text = modalValues.footer_text ?? embed.footer?.text ?? null;
  const icon_url = modalValues.footer_icon_url ?? embed.footer?.icon_url ?? null;
  embed.footer = (text || icon_url) ? { text: text || null, icon_url: icon_url || null } : null;
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
