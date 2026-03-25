import * as channelRepo from '../repositories/channelRepository.js';

export async function listByServer(serverId, categoryType = null) {
  return channelRepo.listByServer(serverId, categoryType ?? undefined);
}

export async function getByCategoryId(categoryId) {
  return channelRepo.getByCategoryId(categoryId);
}

export async function upsertChannel(categoryId, serverId, categoryType, channelsIdx = 0) {
  return channelRepo.upsert(categoryId, serverId, categoryType, channelsIdx);
}

export async function deleteStatsByServerId(serverId) {
  return channelRepo.deleteStatsByServerId(serverId);
}
