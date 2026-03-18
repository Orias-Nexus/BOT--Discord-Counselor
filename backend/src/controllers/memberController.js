import * as memberService from '../services/memberService.js';
import * as serverService from '../services/serverService.js';

function isGatewayOrHtmlError(message) {
    if (!message || typeof message !== 'string') return false;
    return message.includes('<!DOCTYPE') || message.includes('502') || message.includes('Bad gateway') || message.includes('503');
}

function normalizeError(err) {
    const msg = err?.message ?? String(err);
    if (isGatewayOrHtmlError(msg)) {
        return { status: 503, message: 'Database temporarily unavailable (502). Please try again later.' };
    }
    return { status: 500, message: msg };
}

export async function getMember(req, res) {
    try {
        const { serverId, userId } = req.params;
        await serverService.ensureServer(serverId);
        let member = await memberService.getMember(serverId, userId);
        if (!member) member = await memberService.ensureMember(serverId, userId);
        res.json(member);
    } catch (err) {
        const { status, message } = normalizeError(err);
        if (status === 503) {
            console.warn('[memberController] getMember: database 502/503', err?.message?.slice(0, 80));
        } else {
            console.error('[memberController] getMember:', err);
        }
        res.status(status).json({ error: message });
    }
}

export async function setLevel(req, res) {
    try {
        const { serverId, userId } = req.params;
        const { level } = req.body || {};
        await serverService.ensureServer(serverId);
        const member = await memberService.setMemberLevel(serverId, userId, Number(level));
        if (!member) return res.status(400).json({ error: 'Invalid level' });
        res.json(member);
    } catch (err) {
        const { status, message } = normalizeError(err);
        if (status === 503) console.warn('[memberController] setLevel: database 502/503');
        else console.error('[memberController] setLevel:', err);
        res.status(status).json({ error: message });
    }
}

export async function setStatus(req, res) {
    try {
        const { serverId, userId } = req.params;
        const { status, expiresAt } = req.body || {};
        await serverService.ensureServer(serverId);
        const member = await memberService.setMemberStatus(serverId, userId, status, expiresAt);
        res.json(member);
    } catch (err) {
        const { status, message } = normalizeError(err);
        if (status === 503) console.warn('[memberController] setStatus: database 502/503');
        else console.error('[memberController] setStatus:', err);
        res.status(status).json({ error: message });
    }
}

export async function getLevelRange(req, res) {
    try {
        const range = await memberService.getLevelRange();
        res.json(range);
    } catch (err) {
        const { status, message } = normalizeError(err);
        if (status === 503) console.warn('[memberController] getLevelRange: database 502/503');
        else console.error('[memberController] getLevelRange:', err);
        res.status(status).json({ error: message });
    }
}

/** POST /api/members/process-expires: set Good for expired members, return list for directive to apply roles. */
export async function processExpires(req, res) {
    try {
        const result = await memberService.processExpiredMembers();
        res.json(result);
    } catch (err) {
        const { status, message } = normalizeError(err);
        if (status === 503) console.warn('[memberController] processExpires: database 502/503');
        else console.error('[memberController] processExpires:', err);
        res.status(status).json({ error: message });
    }
}
