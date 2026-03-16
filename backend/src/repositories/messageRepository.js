import { prisma } from '../config/prisma.js';

function rowToMessage(row) {
    if (!row) return null;
    return {
        messages_id: row.messages_id,
        messages_type: row.messages_type,
        server_id: row.server_id,
        channel_id: row.channel_id ?? '0',
        embed_id: row.embed_id ?? null,
    };
}

export async function listByServer(serverId) {
    const rows = await prisma.messages.findMany({
        where: { server_id: serverId },
        orderBy: { messages_type: 'asc' }
    });
    return rows.map(rowToMessage);
}

export async function getByServerAndType(serverId, messagesType) {
    const row = await prisma.messages.findFirst({
        where: { 
            server_id: serverId,
            messages_type: messagesType
        }
    });
    return rowToMessage(row);
}

export async function setChannel(serverId, messagesType, channelId) {
    const existing = await getByServerAndType(serverId, messagesType);
    
    if (existing) {
        const row = await prisma.messages.update({
            where: { messages_id: existing.messages_id },
            data: {
                channel_id: channelId ?? null,
                updated_at: new Date()
            }
        });
        return rowToMessage(row);
    }
    
    const row = await prisma.messages.create({
        data: { 
            server_id: serverId, 
            messages_type: messagesType, 
            channel_id: channelId ?? null 
        }
    });
    return rowToMessage(row);
}

export async function setEmbed(serverId, messagesType, embedId) {
    const existing = await getByServerAndType(serverId, messagesType);
    
    if (existing) {
        const row = await prisma.messages.update({
            where: { messages_id: existing.messages_id },
            data: {
                embed_id: embedId ?? null,
                updated_at: new Date()
            }
        });
        return rowToMessage(row);
    }
    
    const row = await prisma.messages.create({
        data: { 
            server_id: serverId, 
            messages_type: messagesType, 
            channel_id: null, 
            embed_id: embedId ?? null 
        }
    });
    return rowToMessage(row);
}

const MESSAGE_TYPES_FOR_NEW_SERVER = ['Greeting', 'Leaving', 'Boosting', 'Leveling', 'Logging'];

<<<<<<< HEAD
/** Create message records for new server if missing. */
=======
/** Create 3 message records (Greeting, Leaving, Boosting) for new server if missing. */
>>>>>>> 81ec429 (Update error messages and documentation: Translate error messages and comments from Vietnamese to English for better clarity and accessibility. Enhance consistency in API documentation across various scripts and modules.)
export async function ensureMessagesForServer(serverId) {
    for (const messagesType of MESSAGE_TYPES_FOR_NEW_SERVER) {
        const existing = await getByServerAndType(serverId, messagesType);
        if (existing) continue;
        
        await prisma.messages.create({
            data: { 
                server_id: serverId, 
                messages_type: messagesType, 
                channel_id: null, 
                embed_id: null 
            }
        });
    }
    return listByServer(serverId);
}
