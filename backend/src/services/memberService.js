import * as memberRepo from '../repositories/memberRepository.js';
import * as levelRepo from '../repositories/levelRepository.js';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache.js';

const MEMBER_TTL = 120;
const memberKey = (sid, uid) => `member:${sid}:${uid}`;

export async function getMember(serverId, userId) {
    const cached = await cacheGet(memberKey(serverId, userId));
    if (cached) return cached;
    const member = await memberRepo.getByServerAndUser(serverId, userId);
    if (member) await cacheSet(memberKey(serverId, userId), member, MEMBER_TTL);
    return member;
}

export async function ensureMember(serverId, userId) {
    const member = await memberRepo.ensure(serverId, userId);
    await cacheSet(memberKey(serverId, userId), member, MEMBER_TTL);
    return member;
}

export async function setMemberLevel(serverId, userId, level) {
    const expRow = await levelRepo.getByLevel(Number(level));
    if (!expRow) return null;
    const member = await memberRepo.updateLevel(serverId, userId, level, expRow.exp);
    await cacheDel(memberKey(serverId, userId));
    return member;
}

export async function setMemberStatus(serverId, userId, status, expiresAt = null) {
    const member = await memberRepo.updateStatus(serverId, userId, status, expiresAt);
    await cacheDel(memberKey(serverId, userId));
    return member;
}

export async function getLevelRange() {
    return levelRepo.getMinMax();
}

/**
 * Đặt Good cho mọi member đã hết hạn (member_expires <= now).
 * Gọi định kỳ từ backend.
 */
export async function processExpiredMembers() {
    const result = await memberRepo.processExpiredMembers();
    for (const { server_id, user_id } of result.updated ?? []) {
        await cacheDel(memberKey(server_id, user_id));
    }
    return result;
}
