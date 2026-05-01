/**
 * Client-side placeholder preview resolver.
 * Replaces {placeholder} tokens with sample values so users can preview embeds.
 */

const SAMPLE_VALUES = {
  user: '@SampleUser',
  user_tag: 'SampleUser#1234',
  user_name: 'SampleUser',
  user_avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
  user_discrim: '1234',
  user_id: '123456789012345678',
  user_nick: 'CoolNickname',
  user_joindate: new Date().toLocaleDateString(),
  user_createdate: '2020-01-15',
  user_displaycolor: '#5865F2',
  user_boostsince: 'N/A',
  user_balance: '1000',
  user_balance_locale: '1,000',
  user_exp: '2500',
  user_rank: '#3',
  member_exp: '1200',
  member_level: '5',
  member_rank: '#7',
  server_name: 'My Server',
  server_id: '987654321098765432',
  server_membercount: '150',
  server_membercount_ordinal: '150th',
  server_icon: 'https://cdn.discordapp.com/embed/avatars/1.png',
  server_owner: '@Owner',
  server_boostlevel: 'Level 2',
  server_boostcount: '14',
  server_status: 'Premium',
  server_class: 'Premium',
  channel: '#general',
  channel_name: 'general',
  date: new Date().toLocaleString(),
  newline: '\n',
  embed_name: 'Preview Embed',
  blank_banner: 'https://cdn.discordapp.com/embed/avatars/2.png',
};

const PLACEHOLDER_REGEX = /\{([a-z_][a-z0-9_]*)\}/gi;

/**
 * Replace all {placeholder} tokens with sample values for preview.
 * @param {string} text
 * @returns {string}
 */
export function resolvePreviewPlaceholders(text) {
  if (typeof text !== 'string') return text;
  return text.replace(PLACEHOLDER_REGEX, (match, key) => {
    const lower = key.toLowerCase();
    return SAMPLE_VALUES[lower] ?? match;
  });
}

/**
 * Recursively resolve placeholders in an embed object for preview.
 * @param {any} obj
 * @returns {any}
 */
export function resolveEmbedPreview(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return resolvePreviewPlaceholders(obj);
  if (Array.isArray(obj)) return obj.map(resolveEmbedPreview);
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = resolveEmbedPreview(v);
    }
    return out;
  }
  return obj;
}

/**
 * Check if a string contains any {placeholder} tokens.
 */
export function hasPlaceholders(text) {
  if (typeof text !== 'string') return false;
  return PLACEHOLDER_REGEX.test(text);
}
