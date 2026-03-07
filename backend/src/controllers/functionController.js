import * as functionService from '../services/functionService.js';

export async function getByScript(req, res) {
    try {
        const { scriptName } = req.params;
        const fn = await functionService.getFunctionByScript(scriptName);
        if (!fn) return res.status(404).json({ error: 'Function not found' });
        res.json(fn);
    } catch (err) {
        console.error('[functionController] getByScript:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function getAllSlash(req, res) {
    try {
        const list = await functionService.getAllSlashCommands();
        res.json(list);
    } catch (err) {
        console.error('[functionController] getAllSlash:', err);
        res.status(500).json({ error: err.message });
    }
}
