import * as userRepo from '../repositories/userRepository.js';
import * as levelService from './levelService.js';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache.js';

const USER_TTL = 120;
const userKey = (uid) => `user:${uid}`;

export async function getUser(userId) {
    const cached = await cacheGet(userKey(userId));
    if (cached) return cached;
    const user = await userRepo.getById(userId);
    if (user) await cacheSet(userKey(userId), user, USER_TTL);
    return user;
}

export async function ensureUser(userId) {
    const user = await userRepo.ensure(userId);
    await cacheSet(userKey(userId), user, USER_TTL);
    return user;
}

/**
 * Atomically add EXP to a user (global), check level-up, update level if needed.
 * Returns { user_exp, user_level, leveled_up, old_level, new_level }.
 */
export async function addUserExp(userId, expAmount) {
    const updated = await userRepo.addExp(userId, expAmount);
    if (!updated) return null;

    const oldLevel = updated.user_level;
    const newLevel = await levelService.getLevelForExp(updated.user_exp);

    let leveledUp = false;
    if (newLevel > oldLevel) {
        await userRepo.updateLevel(userId, newLevel);
        updated.user_level = newLevel;
        leveledUp = true;
    }

    await cacheDel(userKey(userId));

    return {
        user_exp: updated.user_exp,
        user_level: updated.user_level,
        leveled_up: leveledUp,
        old_level: oldLevel,
        new_level: newLevel,
    };
}

export async function getUserLeaderboard(limit = 20) {
    return userRepo.getLeaderboard(limit);
}

export async function getUserRank(userId) {
    return userRepo.getRank(userId);
}
