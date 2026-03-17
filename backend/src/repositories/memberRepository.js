import { prisma } from '../config/prisma.js';
import * as userRepo from './userRepository.js';

const STATUS_API_TO_DB = { Good: 'Good', Warning: 'Warn', Muted: 'Mute', Locked: 'Lock', Newbie: 'Newbie', Leaved: 'Leaved' };
const STATUS_DB_TO_API = { Good: 'Good', Warn: 'Warning', Mute: 'Muted', Lock: 'Locked', Kick: 'Kick', Leaved: 'Leaved', Newbie: 'Newbie' };

function rowToMember(row) {
    if (!row) return null;
    return {
        user_id: row.user_id,
        server_id: row.server_id,
        member_exp: row.member_exp ? Number(row.member_exp) : 0,
        member_level: row.member_level ?? 0,
        member_status: STATUS_DB_TO_API[row.member_status] ?? row.member_status,
        member_expires: row.member_expires ?? null,
    };
}

export async function getByServerAndUser(serverId, userId) {
    const row = await prisma.members.findUnique({
        where: { server_id_user_id: { server_id: serverId, user_id: userId } }
    });
    return rowToMember(row);
}

export async function ensure(serverId, userId) {
    await userRepo.ensure(userId);
    
    const row = await prisma.members.upsert({
        where: { server_id_user_id: { server_id: serverId, user_id: userId } },
        update: {}, // Nếu đã tồn tại thì không update gì ban đầu
        create: {
            server_id: serverId,
            user_id: userId,
            member_level: 0,
            member_status: 'Good',
            member_expires: null,
            created_at: new Date(),
            updated_at: new Date()
        }
    });

    return rowToMember(row);
}

export async function updateLevel(serverId, userId, memberLevel, memberExp = null) {
    const payload = { 
        member_level: Number(memberLevel), 
        updated_at: new Date() 
    };
    if (memberExp !== null && memberExp !== undefined) {
        payload.member_exp = BigInt(memberExp);
    }
    
    const row = await prisma.members.update({
        where: { server_id_user_id: { server_id: serverId, user_id: userId } },
        data: payload
    });

    return rowToMember(row);
}

export async function updateStatus(serverId, userId, status, expiresAt = null) {
    const dbStatus = STATUS_API_TO_DB[status] ?? status;
    
    const row = await prisma.members.update({
        where: { server_id_user_id: { server_id: serverId, user_id: userId } },
        data: {
            member_status: dbStatus,
            member_expires: expiresAt ? new Date(expiresAt) : null,
            updated_at: new Date(),
        }
    });

    return rowToMember(row);
}

/**
 * Đặt Good cho mọi member có member_expires <= now và member_status != 'Good'.
 * Trả về { count, updated: [{ server_id, user_id }, ...] } để directive áp dụng role.
 */
export async function processExpiredMembers() {
    const now = new Date();
    
    // Tìm các bản ghi hợp lệ thỏa mãn điều kiện trước khi update
    const expiredMembers = await prisma.members.findMany({
        where: {
            member_expires: { lte: now, not: null },
            member_status: { not: 'Good' }
        },
        select: { server_id: true, user_id: true }
    });

    if (expiredMembers.length === 0) return { count: 0, updated: [] };

    // Update tất cả các bản ghi đã tìm được
    const result = await prisma.members.updateMany({
        where: {
            member_expires: { lte: now, not: null },
            member_status: { not: 'Good' }
        },
        data: {
            member_status: 'Good',
            member_expires: null,
            updated_at: now,
        }
    });

    return { count: result.count, updated: expiredMembers };
}
