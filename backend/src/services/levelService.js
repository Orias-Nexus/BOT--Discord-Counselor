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
