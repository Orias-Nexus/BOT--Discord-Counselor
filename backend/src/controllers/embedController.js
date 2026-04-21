import * as embedRepo from '../repositories/embedRepository.js';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache.js';

const EMBED_TTL = 120;
const listKey = (sid) => `embeds:list:${sid}`;
const itemKey = (sid, eid) => `embeds:${sid}:${eid}`;

export async function listByServer(req, res) {
    try {
        const { serverId } = req.params;
        const cached = await cacheGet(listKey(serverId));
        if (cached) return res.json(cached);
        const list = await embedRepo.listByServer(serverId);
        await cacheSet(listKey(serverId), list, EMBED_TTL);
        res.json(list);
    } catch (err) {
        console.error('[embedController] listByServer:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function getById(req, res) {
    try {
        const { serverId, embedId } = req.params;
        const cached = await cacheGet(itemKey(serverId, embedId));
        if (cached) return res.json(cached);
        const row = await embedRepo.getById(serverId, embedId);
        if (!row) return res.status(404).json({ error: 'Embed not found' });
        await cacheSet(itemKey(serverId, embedId), row, EMBED_TTL);
        res.json(row);
    } catch (err) {
        console.error('[embedController] getById:', err);
        res.status(500).json({ error: err.message });
    }
}

import { checkFeatureLimit } from '../utils/features.js';

export async function create(req, res) {
    try {
        const { serverId } = req.params;
        const { embed_name, embed } = req.body;
        if (!embed_name || typeof embed_name !== 'string') {
            return res.status(400).json({ error: 'embed_name is required' });
        }
        
        await checkFeatureLimit(serverId, 'embed_create_limit');

        const row = await embedRepo.create(serverId, embed_name.trim(), embed ?? null);
        await cacheDel(listKey(serverId));
        res.status(201).json(row);
    } catch (err) {
        if (err.status === 403) return res.status(403).json({ error: err.message });
        console.error('[embedController] create:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function update(req, res) {
    try {
        const { serverId, embedId } = req.params;
        const body = req.body || {};
        const row = await embedRepo.update(serverId, embedId, body);
        await cacheDel(listKey(serverId), itemKey(serverId, embedId));
        res.json(row);
    } catch (err) {
        console.error('[embedController] update:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function remove(req, res) {
    try {
        const { serverId, embedId } = req.params;
        await embedRepo.remove(serverId, embedId);
        await cacheDel(listKey(serverId), itemKey(serverId, embedId));
        res.status(204).send();
    } catch (err) {
        console.error('[embedController] remove:', err);
        res.status(500).json({ error: err.message });
    }
}
