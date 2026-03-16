import * as memberRepo from '../repositories/memberRepository.js';
import * as levelRepo from '../repositories/levelRepository.js';

export async function getMember(serverId, userId) {
    return memberRepo.getByServerAndUser(serverId, userId);
}

export async function ensureMember(serverId, userId) {
    return memberRepo.ensure(serverId, userId);
}

export async function setMemberLevel(serverId, userId, level) {
    const expRow = await levelRepo.getByLevel(Number(level));
    if (!expRow) return null;
    return memberRepo.updateLevel(serverId, userId, level, expRow.exp);
}

export async function setMemberStatus(serverId, userId, status, expiresAt = null) {
    return memberRepo.updateStatus(serverId, userId, status, expiresAt);
}

export async function getLevelRange() {
    return levelRepo.getMinMax();
}

/**
 * Đặt Good cho mọi member đã hết hạn (member_expires <= now).
 * Gọi định kỳ từ backend.
 */
export async function processExpiredMembers() {
    return memberRepo.processExpiredMembers();
}
