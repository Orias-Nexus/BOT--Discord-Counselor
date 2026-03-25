import * as userService from '../services/userService.js';

function normalizeError(err) {
    const msg = err?.message ?? String(err);
    const isGateway = msg.includes('<!DOCTYPE') || msg.includes('502') || msg.includes('503');
    if (isGateway) return { status: 503, message: 'Database temporarily unavailable. Please try again later.' };
    return { status: 500, message: msg };
}

export async function getUser(req, res) {
    try {
        const { userId } = req.params;
        let user = await userService.getUser(userId);
        if (!user) user = await userService.ensureUser(userId);
        res.json(user);
    } catch (err) {
        const { status, message } = normalizeError(err);
        console.error('[userController] getUser:', err);
        res.status(status).json({ error: message });
    }
}

export async function addExp(req, res) {
    try {
        const { userId } = req.params;
        const { exp } = req.body || {};
        if (!exp || exp <= 0) return res.status(400).json({ error: 'exp must be positive' });
        const result = await userService.addUserExp(userId, Number(exp));
        if (!result) return res.status(400).json({ error: 'Failed to add exp' });
        res.json(result);
    } catch (err) {
        const { status, message } = normalizeError(err);
        console.error('[userController] addExp:', err);
        res.status(status).json({ error: message });
    }
}

export async function getLeaderboard(req, res) {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const data = await userService.getUserLeaderboard(limit);
        res.json(data);
    } catch (err) {
        const { status, message } = normalizeError(err);
        console.error('[userController] getLeaderboard:', err);
        res.status(status).json({ error: message });
    }
}

export async function getRank(req, res) {
    try {
        const { userId } = req.params;
        const rank = await userService.getUserRank(userId);
        res.json({ rank });
    } catch (err) {
        const { status, message } = normalizeError(err);
        console.error('[userController] getRank:', err);
        res.status(status).json({ error: message });
    }
}
