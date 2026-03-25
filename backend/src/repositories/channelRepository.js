import { prisma } from '../config/prisma.js';

export async function listByServer(serverId, categoryType = null) {
  const where = { server_id: serverId };
  if (categoryType) where.category_type = categoryType;
  
  const channels = await prisma.channels.findMany({
    where,
    orderBy: { category_type: 'asc' }
  });
  
  return channels.map(row => ({
    category_id: row.category_id,
    category_type: row.category_type,
    server_id: row.server_id,
    channels_idx: row.channels_idx || 0,
  }));
}

export async function getByCategoryId(categoryId) {
  const row = await prisma.channels.findUnique({
    where: { category_id: categoryId }
  });
  if (!row) return null;
  
  return {
    category_id: row.category_id,
    category_type: row.category_type,
    server_id: row.server_id,
    channels_idx: row.channels_idx || 0,
  };
}

export async function upsert(categoryId, serverId, categoryType, channelsIdx = 0) {
  const payload = {
    category_id: categoryId,
    server_id: serverId,
    category_type: categoryType,
    channels_idx: channelsIdx,
    updated_at: new Date()
  };

  const row = await prisma.channels.upsert({
    where: { category_id: categoryId },
    update: payload,
    create: payload
  });

  return {
    category_id: row.category_id,
    category_type: row.category_type,
    server_id: row.server_id,
    channels_idx: row.channels_idx || 0,
  };
}

export async function deleteByCategoryId(categoryId) {
  await prisma.channels.delete({
    where: { category_id: categoryId }
  }).catch(() => {}); // Bỏ qua lỗi nếu không tồn tại
}

export async function deleteStatsByServerId(serverId) {
  const result = await prisma.channels.deleteMany({
    where: {
      server_id: serverId,
      category_type: 'Stats'
    }
  });

  return result.count;
}
