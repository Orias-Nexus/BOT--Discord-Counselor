import { prisma } from '../config/prisma.js';

export async function getById(userId) {
    const row = await prisma.users.findUnique({
        where: { user_id: userId }
    });
    
    if (!row) return null;
    
    return {
        ...row,
        user_exp: row.user_exp ? Number(row.user_exp) : 0
    };
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
    
    return {
        ...row,
        user_exp: row.user_exp ? Number(row.user_exp) : 0
    };
}
