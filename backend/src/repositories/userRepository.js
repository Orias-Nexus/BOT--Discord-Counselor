import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

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
    try {
        const created = await prisma.users.create({
            data: {
                user_id: userId,
                user_exp: 0,
                user_level: 0,
            },
        });
        return rowToUser(created);
    } catch (err) {
        // Another concurrent request may have created the same user_id.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const existing = await prisma.users.findUnique({ where: { user_id: userId } });
            return rowToUser(existing);
        }
        throw err;
    }
}

export async function addExp(userId, expAmount) {
    const amount = BigInt(expAmount);
    try {
        const row = await prisma.users.update({
            where: { user_id: userId },
            data: {
                user_exp: { increment: amount },
                updated_at: new Date(),
            },
        });
        return rowToUser(row);
    } catch (err) {
        // User does not exist yet: create with initial exp.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            try {
                const created = await prisma.users.create({
                    data: {
                        user_id: userId,
                        user_exp: amount,
                        user_level: 0,
                    },
                });
                return rowToUser(created);
            } catch (createErr) {
                // If concurrent create happened, retry update once.
                if (createErr instanceof Prisma.PrismaClientKnownRequestError && createErr.code === 'P2002') {
                    const retried = await prisma.users.update({
                        where: { user_id: userId },
                        data: {
                            user_exp: { increment: amount },
                            updated_at: new Date(),
                        },
                    });
                    return rowToUser(retried);
                }
                throw createErr;
            }
        }
        throw err;
    }
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
