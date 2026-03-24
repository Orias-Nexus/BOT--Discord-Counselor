import * as levelRepo from '../repositories/levelRepository.js';

export async function getAllLevels() {
    return levelRepo.getAll();
}

export async function getLevelRange() {
    return levelRepo.getMinMax();
}

export async function getExpForLevel(level) {
    const row = await levelRepo.getByLevel(Number(level));
    return row?.exp ?? null;
}

/**
 * Binary search: find the highest level whose required EXP <= totalExp.
 * Uses the in-memory cached levels array (sorted by level ASC, exp ASC).
 */
export async function getLevelForExp(totalExp) {
    const levels = await levelRepo.getAllCached();
    if (!levels || levels.length === 0) return 0;

    let lo = 0;
    let hi = levels.length - 1;
    let result = 0;

    while (lo <= hi) {
        const mid = (lo + hi) >>> 1;
        if (levels[mid].exp <= totalExp) {
            result = levels[mid].level;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    return result;
}

/**
 * Returns { currentExp, nextLevelExp } for progress display.
 */
export async function getLevelProgress(totalExp, currentLevel) {
    const levels = await levelRepo.getAllCached();
    if (!levels || levels.length === 0) return { currentLevelExp: 0, nextLevelExp: 0 };

    const currentLevelExp = levels[currentLevel]?.exp ?? 0;
    const nextLevelExp = levels[currentLevel + 1]?.exp ?? null;

    return { currentLevelExp, nextLevelExp };
}
