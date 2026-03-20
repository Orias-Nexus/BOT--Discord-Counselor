import * as functionRepo from '../repositories/functionRepository.js';
import { cacheGet, cacheSet } from '../utils/cache.js';

const FN_TTL = 600;

export async function getFunctionByScript(scriptName) {
    const key = `function:${scriptName}`;
    const cached = await cacheGet(key);
    if (cached) return cached;
    const fn = await functionRepo.getByScript(scriptName);
    if (fn) await cacheSet(key, fn, FN_TTL);
    return fn;
}

export async function getAllSlashCommands() {
    const key = 'function:slashList';
    const cached = await cacheGet(key);
    if (cached) return cached;
    const list = await functionRepo.getAllSlash();
    await cacheSet(key, list, FN_TTL);
    return list;
}

export function replacePlaceholders(content, vars = {}) {
    if (typeof content !== 'string') return '';
    return content.replace(/\{([^}]+)\}/g, (_, key) => {
        const v = vars[key];
        return v !== undefined && v !== null ? String(v) : `{${key}}`;
    });
}
