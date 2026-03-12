import { prisma } from '../config/prisma.js';

function rowToUser(row) {
    if (!row) return null;
    return {
        user_id: row.user_id,
        user_exp: row.user_exp ? Number(row.user_exp) : 0,
        user_level: row.user_level ?? 0,
    };
}

export async function getById(userId) {
    const row = await prisma.users.findUnique({
        where: { user_id: userId }
    });
    return rowToUser(row);
}

export async function ensure(userId) {
    const row = await prisma.users.upsert({
        where: { user_id: userId },
        update: {},
        create: {
            user_id: userId,
            user_exp: 0,
            user_level: 0,
        }
    });
    return rowToUser(row);
}

export async function addExp(userId, expAmount) {
    const row = await prisma.users.update({
        where: { user_id: userId },
        data: {
            user_exp: { increment: BigInt(expAmount) },
            updated_at: new Date(),
        },
    });
    return rowToUser(row);
}

export async function updateLevel(userId, level) {
    const row = await prisma.users.update({
        where: { user_id: userId },
        data: { user_level: Number(level), updated_at: new Date() },
    });
    return rowToUser(row);
}

export async function getLeaderboard(limit = 20) {
    const rows = await prisma.users.findMany({
        orderBy: { user_exp: 'desc' },
        take: limit,
        select: { user_id: true, user_exp: true, user_level: true },
    });
    return rows.map(rowToUser);
}

export async function getRank(userId) {
    const user = await prisma.users.findUnique({
        where: { user_id: userId },
        select: { user_exp: true },
    });
    if (!user) return null;
    const count = await prisma.users.count({
        where: { user_exp: { gt: user.user_exp } },
    });
    return count + 1;
}
