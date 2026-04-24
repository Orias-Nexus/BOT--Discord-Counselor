import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { cacheGet, cacheSet } from '../utils/cache.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VARIABLES_PATH = path.resolve(__dirname, '../../../assets/configs/variables.json');
const CACHE_KEY = 'variables:list';
const CACHE_TTL = 10 * 60;

function classify(key) {
  if (key.startsWith('user_') || key === 'user') return 'User';
  if (key.startsWith('server_')) return 'Server';
  if (key.startsWith('channel_')) return 'Channel';
  if (key.startsWith('member_')) return 'Member';
  if (key.startsWith('message_')) return 'Message';
  return 'General';
}

async function readVariables() {
  const raw = await fs.readFile(VARIABLES_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  const placeholders = parsed.placeholders ?? {};
  const list = Object.entries(placeholders).map(([key, meta]) => ({
    key,
    description: meta.desc || meta.description || '',
    hasArgument: meta.has_argument === true,
    category: classify(key),
    example: meta.example ?? null,
  }));
  list.sort((a, b) => {
    if (a.category === b.category) return a.key.localeCompare(b.key);
    return a.category.localeCompare(b.category);
  });
  return list;
}

export async function listVariables(_req, res) {
  try {
    const cached = await cacheGet(CACHE_KEY);
    if (cached) return res.json(cached);
    const list = await readVariables();
    await cacheSet(CACHE_KEY, list, CACHE_TTL);
    return res.json(list);
  } catch (err) {
    console.error('[variablesController] list:', err);
    return res.status(500).json({ error: 'Failed to load variables' });
  }
}
