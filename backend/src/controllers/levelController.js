import * as levelService from '../services/levelService.js';

export async function getAll(req, res) {
    try {
        const levels = await levelService.getAllLevels();
        res.json(levels);
    } catch (err) {
        console.error('[levelController] getAll:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function getRange(req, res) {
    try {
        const range = await levelService.getLevelRange();
        res.json(range);
    } catch (err) {
        console.error('[levelController] getRange:', err);
        res.status(500).json({ error: err.message });
    }
}

/** GET /api/levels/progress?exp=X&level=Y -> { currentLevelExp, nextLevelExp } */
export async function getProgress(req, res) {
    try {
        const exp = Number(req.query.exp ?? 0);
        const level = Number(req.query.level ?? 0);
        const data = await levelService.getLevelProgress(exp, level);
        res.json(data);
    } catch (err) {
        console.error('[levelController] getProgress:', err);
        res.status(500).json({ error: err.message });
    }
}
