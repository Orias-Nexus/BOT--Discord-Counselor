import * as messageRepo from '../repositories/messageRepository.js';

const VALID_TYPES = ['Greeting', 'Leaving', 'Boosting', 'Leveling', 'Logging'];

function checkType(req, res, next) {
    const type = req.params.messagesType;
    if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ error: `messagesType must be one of: ${VALID_TYPES.join(', ')}` });
    }
    next();
}

export async function listByServer(req, res) {
    try {
        const { serverId } = req.params;
        const list = await messageRepo.listByServer(serverId);
        res.json(list);
    } catch (err) {
        console.error('[messageController] listByServer:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function getByType(req, res) {
    try {
        const { serverId, messagesType } = req.params;
        const row = await messageRepo.getByServerAndType(serverId, messagesType);
        if (!row) return res.status(404).json({ error: 'Message config not found' });
        res.json(row);
    } catch (err) {
        console.error('[messageController] getByType:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function setChannel(req, res) {
    try {
        const { serverId, messagesType } = req.params;
        const { channel_id } = req.body;
        const row = await messageRepo.setChannel(serverId, messagesType, channel_id ?? null);
        res.json(row);
    } catch (err) {
        console.error('[messageController] setChannel:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function setEmbed(req, res) {
    try {
        const { serverId, messagesType } = req.params;
        const { embed_id } = req.body;
        const row = await messageRepo.setEmbed(serverId, messagesType, embed_id ?? null);
        res.json(row);
    } catch (err) {
        console.error('[messageController] setEmbed:', err);
        res.status(500).json({ error: err.message });
    }
}

export { checkType };
