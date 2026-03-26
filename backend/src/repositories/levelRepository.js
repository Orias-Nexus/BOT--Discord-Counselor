import { prisma } from '../config/prisma.js';

/** In-memory cache: sorted array of { level, exp } loaded once from DB. */
let levelsCache = null;

export async function getAll() {
    const rows = await prisma.levels.findMany({
        select: { level: true, exp: true },
        orderBy: { level: 'asc' }
    });
    
    return rows.map(r => ({ ...r, exp: Number(r.exp) }));
}

/**
 * Returns the full sorted levels array, loading from DB on first call.
 * Cached permanently in memory (levels table is static).
 */
export async function getAllCached() {
    if (levelsCache) return levelsCache;
    levelsCache = await getAll();
    return levelsCache;
}

export async function getByLevel(level) {
    const row = await prisma.levels.findUnique({
        where: { level: Number(level) },
        select: { level: true, exp: true }
    });
    
    if (!row) return null;
    return { ...row, exp: Number(row.exp) };
}

export async function getMinMax() {
    const [minLevel, maxLevel] = await Promise.all([
        prisma.levels.aggregate({ _min: { level: true } }),
        prisma.levels.aggregate({ _max: { level: true } })
    ]);

    if (minLevel._min.level == null || maxLevel._max.level == null) return { min: 0, max: 0 };
    return { min: minLevel._min.level, max: maxLevel._max.level };
}
