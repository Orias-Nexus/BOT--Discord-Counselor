import * as functionRepo from '../repositories/functionRepository.js';

export async function getFunctionByScript(scriptName) {
    return functionRepo.getByScript(scriptName);
}

export async function getAllSlashCommands() {
    return functionRepo.getAllSlash();
}

export function replacePlaceholders(content, vars = {}) {
    if (typeof content !== 'string') return '';
    return content.replace(/\{([^}]+)\}/g, (_, key) => {
        const v = vars[key];
        return v !== undefined && v !== null ? String(v) : `{${key}}`;
    });
}
