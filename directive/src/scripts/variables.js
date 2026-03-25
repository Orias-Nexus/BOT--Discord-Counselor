import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { EMBED_COLORS } from '../embeds/schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, '../../../variables.json');

const CATEGORY_LABELS = {
  placeholders: '📋 Placeholders',
  advanced_logic: '🔀 Advanced Logic',
  modifiers: '⚙️ Modifiers',
  guards: '🛡️ Guards',
  actions: '⚡ Actions',
};

function loadVariables() {
  const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  const fields = [];

  for (const [category, entries] of Object.entries(raw)) {
    const label = CATEGORY_LABELS[category] ?? category;
    const lines = Object.entries(entries).map(([tag, meta]) => {
      const syntax = meta.is_bracket_syntax ? `[\`${tag}\`]` : `\`{${tag}}\``;
      return `${syntax} — ${meta.desc}`;
    });

    const MAX_FIELD_LEN = 1024;
    let chunk = '';
    let part = 1;
    for (const line of lines) {
      const next = chunk ? `${chunk}\n${line}` : line;
      if (next.length > MAX_FIELD_LEN) {
        fields.push({ name: `${label} (${part})`, value: chunk, inline: false });
        chunk = line;
        part++;
      } else {
        chunk = next;
      }
    }
    if (chunk) {
      fields.push({ name: part > 1 ? `${label} (${part})` : label, value: chunk, inline: false });
    }
  }

  return fields;
}

export async function run(interaction) {
  if (!interaction.deferred) await interaction.deferReply();

  const fields = loadVariables();

  const embeds = [];
  let current = {
    title: '✦ Variables Reference',
    color: EMBED_COLORS.DEFAULT,
    description: 'Danh sách tất cả biến (variables) có thể sử dụng trong custom commands và embeds.',
    fields: [],
  };

  for (const field of fields) {
    if (current.fields.length >= 25) {
      embeds.push(current);
      current = { color: EMBED_COLORS.DEFAULT, fields: [] };
    }
    current.fields.push(field);
  }
  if (current.fields.length > 0) embeds.push(current);

  await interaction.editReply({ embeds: embeds.slice(0, 10) });
}
