import axios from 'axios';
import env from '../config/env.js';
import { cacheGet, cacheSet } from '../utils/cache.js';

const INFO_TTL = 30;
const MEMBERS_TTL = 15;
const infoKey = (sid) => `discord:info:${sid}`;
const membersKey = (sid, q, limit) => `discord:members:${sid}:${q || ''}:${limit}`;

async function callDirective(pathname, params = null) {
  const url = `${env.directiveApiUrl}${pathname}`;
  const { data } = await axios.get(url, {
    params,
    headers: { 'x-internal-key': env.internalSecretKey },
    timeout: 5000,
  });
  return data;
}

export async function getDiscordInfo(req, res) {
  try {
    const { serverId } = req.params;
    const cached = await cacheGet(infoKey(serverId));
    if (cached) return res.json(cached);
    const info = await callDirective(`/internal/guild/${serverId}/info`);
    await cacheSet(infoKey(serverId), info, INFO_TTL);
    return res.json(info);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Guild not found on Discord (bot may not be in server)' });
    }
    console.error('[discordInfoController] info:', err.message);
    return res.status(503).json({ error: 'Discord info service unavailable' });
  }
}

export async function listDiscordMembers(req, res) {
  try {
    const { serverId } = req.params;
    const q = (req.query.q ?? '').toString();
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const cacheK = membersKey(serverId, q, limit);
    const cached = await cacheGet(cacheK);
    if (cached) return res.json(cached);
    const data = await callDirective(`/internal/guild/${serverId}/members`, { q, limit });
    await cacheSet(cacheK, data, MEMBERS_TTL);
    return res.json(data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Guild not found on Discord' });
    }
    console.error('[discordInfoController] members:', err.message);
    return res.status(503).json({ error: 'Discord info service unavailable' });
  }
}
