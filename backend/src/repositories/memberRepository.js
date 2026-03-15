import { prisma } from '../config/prisma.js';
import * as userRepo from './userRepository.js';

<<<<<<< HEAD
=======
const TABLE = 'members';
const COLS = 'user_id, server_id, member_exp, member_level, member_status, member_expires';
>>>>>>> 648061a (Add channel management routes and services: implement channelRoutes, channelController, and channelService for enhanced channel operations, including listing, upserting, and deleting channels by server ID.)
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

/**
 * Atomically increment member_exp by expAmount. Returns updated row.
 */
export async function addExp(serverId, userId, expAmount) {
    const row = await prisma.members.update({
        where: { server_id_user_id: { server_id: serverId, user_id: userId } },
        data: {
            member_exp: { increment: BigInt(expAmount) },
            updated_at: new Date(),
        },
    });
    return rowToMember(row);
}

/**
 * Top members by EXP in a server. Returns [{ user_id, member_exp, member_level }].
 */
export async function getLeaderboard(serverId, limit = 20) {
    const rows = await prisma.members.findMany({
        where: { server_id: serverId },
        orderBy: { member_exp: 'desc' },
        take: limit,
        select: { user_id: true, member_exp: true, member_level: true },
    });
    return rows.map((r) => ({
        user_id: r.user_id,
        member_exp: r.member_exp ? Number(r.member_exp) : 0,
        member_level: r.member_level ?? 0,
    }));
}

/**
 * Get the rank (1-based) of a member in a server by EXP.
 */
export async function getRank(serverId, userId) {
    const member = await prisma.members.findUnique({
        where: { server_id_user_id: { server_id: serverId, user_id: userId } },
        select: { member_exp: true },
    });
    if (!member) return null;
    const count = await prisma.members.count({
        where: { server_id: serverId, member_exp: { gt: member.member_exp } },
    });
    return count + 1;
}

/**
 * Đặt Good cho mọi member có member_expires <= now và member_status != 'Good'.
 * Trả về { count, updated: [{ server_id, user_id }, ...] } để directive áp dụng role.
 */
export async function processExpiredMembers() {
    const sb = getSupabase();
    const now = new Date().toISOString();
    const { data, error } = await sb.schema(getSchema()).from(TABLE).update({
        member_status: 'Good',
        member_expires: null,
        updated_at: now,
    }).not('member_expires', 'is', null).lte('member_expires', now).neq('member_status', 'Good').select('user_id, server_id');
    if (error) throw error;
    const updated = (data ?? []).map((r) => ({ server_id: r.server_id, user_id: r.user_id }));
    return { count: updated.length, updated };
}
