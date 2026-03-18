import { prisma } from '../config/prisma.js';

export async function getByScript(scriptName) {
    const row = await prisma.functions.findUnique({
        where: { script: scriptName },
        select: { script: true, slash: true, action: true, event: true }
    });
    return row;
}

export async function getAllSlash() {
    const rows = await prisma.functions.findMany({
        where: { slash: { not: null } },
        select: { script: true, slash: true }
    });
    return rows;
}
