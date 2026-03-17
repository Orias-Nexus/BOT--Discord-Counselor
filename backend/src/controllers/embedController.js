import * as embedRepo from '../repositories/embedRepository.js';

export async function listByServer(req, res) {
    try {
        const { serverId } = req.params;
        const list = await embedRepo.listByServer(serverId);
        res.json(list);
    } catch (err) {
        console.error('[embedController] listByServer:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function getById(req, res) {
    try {
        const { serverId, embedId } = req.params;
        const row = await embedRepo.getById(serverId, embedId);
        if (!row) return res.status(404).json({ error: 'Embed not found' });
        res.json(row);
    } catch (err) {
        console.error('[embedController] getById:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function create(req, res) {
    try {
        const { serverId } = req.params;
        const { embed_name, embed } = req.body;
        if (!embed_name || typeof embed_name !== 'string') {
            return res.status(400).json({ error: 'embed_name is required' });
        }
        const row = await embedRepo.create(serverId, embed_name.trim(), embed ?? null);
        res.status(201).json(row);
    } catch (err) {
        console.error('[embedController] create:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function update(req, res) {
    try {
        const { serverId, embedId } = req.params;
        const body = req.body || {};
        const row = await embedRepo.update(serverId, embedId, body);
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
        res.status(204).send();
    } catch (err) {
        console.error('[embedController] remove:', err);
        res.status(500).json({ error: err.message });
    }
}
