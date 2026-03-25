import { prisma } from '../config/prisma.js';

function rowToEmbed(row) {
    if (!row) return null;
    return {
        embed_id: row.embed_id,
        embed_name: row.embed_name,
        server_id: row.server_id,
        embed: row.embed ?? null,
    };
}

export async function listByServer(serverId) {
    const rows = await prisma.embeds.findMany({
        where: { server_id: serverId },
        orderBy: { embed_name: 'asc' }
    });
    return rows.map(rowToEmbed);
}

export async function getById(serverId, embedId) {
    const row = await prisma.embeds.findFirst({
        where: { 
            server_id: serverId,
            embed_id: embedId
        }
    });
    return rowToEmbed(row);
}

export async function getByName(serverId, embedName) {
    const row = await prisma.embeds.findFirst({
        where: { 
            server_id: serverId,
            embed_name: embedName
        }
    });
    return rowToEmbed(row);
}

export async function create(serverId, embedName, embedData) {
    const row = await prisma.embeds.create({
        data: {
            server_id: serverId,
            embed_name: embedName,
            embed: embedData ?? null,
        }
    });
    return rowToEmbed(row);
}

export async function update(serverId, embedId, payload) {
    const { embed_name, embed } = payload;
    const updatePayload = { updated_at: new Date() };
    if (embed_name !== undefined) updatePayload.embed_name = embed_name;
    if (embed !== undefined) updatePayload.embed = embed;
    
    // First find the embed to ensure it belongs to the server
    const existing = await getById(serverId, embedId);
    if (!existing) throw new Error('Embed not found or access denied');
    
    const row = await prisma.embeds.update({
        where: { embed_id: embedId },
        data: updatePayload
    });
    return rowToEmbed(row);
}

export async function remove(serverId, embedId) {
    // First find the embed to ensure it belongs to the server
    const existing = await getById(serverId, embedId);
    if (!existing) return;
    
    await prisma.embeds.delete({
        where: { embed_id: embedId }
    });
}
