import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedFeatures = null;
let lastLoadTime = 0;

export function loadFeatureLimits() {
    const now = Date.now();
    if (cachedFeatures && now - lastLoadTime < 60000) return cachedFeatures;

    try {
        const pReal = path.join(__dirname, '../../../assets/configs/features.json');
        const data = fs.readFileSync(pReal, 'utf8');
        cachedFeatures = JSON.parse(data);
        lastLoadTime = now;
        return cachedFeatures;
    } catch (err) {
        console.error('[FeatureLimits] Error loading features.json', err);
        return {};
    }
}

export function getLimitsForTier(tier) {
    const raw = loadFeatureLimits();
    const result = { name: tier, description: `${tier} features`, available: true };
    const ranks = Object.values(raw.membership || {});
    const tierIndex = ranks.indexOf(tier);
    
    // Fallback to Standard or index 0
    const targetIndex = tierIndex !== -1 ? tierIndex : 0;

    for (const [key, mapArr] of Object.entries(raw.features || {})) {
        result[key] = mapArr[targetIndex] !== undefined ? mapArr[targetIndex] : -1;
    }
    return result;
}

export async function checkFeatureLimit(serverId, featureKey) {
    const server = await prisma.servers.findUnique({
        where: { server_id: serverId },
        select: { status: true }
    });
    
    if (!server) return;
    let tier = server.status || 'Standard';
    const tierLimits = getLimitsForTier(tier);
    
    let limit = tierLimits[featureKey];
    if (limit === undefined || limit === -1) return;
    if (limit === 0) throw { status: 403, message: `LIMIT_REACHED:${featureKey}` };

    let currentCount = 0;
    
    switch (featureKey) {
        case 'embed_create_limit':
            currentCount = await prisma.embeds.count({ 
                where: { 
                    server_id: serverId,
                    embed_name: { notIn: ['Boost', 'Greet', 'Leave', 'Level'] }
                } 
            });
            break;
        case 'set_voice_creator_limit':
            currentCount = await prisma.channels.count({ where: { server_id: serverId, category_type: 'Creator' } });
            break;
        case 'set_server_stats_limit':
            currentCount = await prisma.channels.count({ where: { server_id: serverId, category_type: 'Stats' } });
            break;
        // Event channels are now boolean controlled via runScript.js (0 = disabled, -1 = unlimited). No counting needed here!
    }
    
    if (currentCount >= limit) {
        throw { status: 403, message: `LIMIT_REACHED:${featureKey}` };
    }
}
