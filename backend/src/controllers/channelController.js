import * as channelService from '../services/channelService.js';
import { normalizeError } from '../utils/errorUtils.js';

function handleError(prefix, err, res) {
  const { status, message } = normalizeError(err);
  if (status === 503) {
    console.warn(`[channelController] ${prefix}: database 502/503`, err?.message?.slice(0, 80));
  } else {
    console.error(`[channelController] ${prefix}:`, err);
  }
  res.status(status).json({ error: message });
}

export async function getChannels(req, res) {
  try {
    const { serverId } = req.params;
    const { type } = req.query;
    const list = await channelService.listByServer(serverId, type || null);
    res.json(list);
  } catch (err) {
    handleError('getChannels', err, res);
  }
}

import { checkFeatureLimit } from '../utils/features.js';

export async function upsertChannel(req, res) {
  try {
    const { serverId } = req.params;
    const { category_id: categoryId, category_type: categoryType, channels_idx: channelsIdx } = req.body || {};
    if (!categoryId || !categoryType) {
      return res.status(400).json({ error: 'category_id and category_type required' });
    }
    
    const existing = await channelService.getByCategoryId(categoryId);
    if (!existing) {
       const limitKey = categoryType === 'Stats' ? 'set_server_stats_limit' : 'set_voice_creator_limit';
       await checkFeatureLimit(serverId, limitKey);
    }

    const row = await channelService.upsertChannel(categoryId, serverId, categoryType, channelsIdx ?? 0);
    res.json(row);
  } catch (err) {
    if (err.status === 403) return res.status(403).json({ error: err.message });
    handleError('upsertChannel', err, res);
  }
}

export async function deleteStatChannels(req, res) {
  try {
    const { serverId } = req.params;
    const count = await channelService.deleteStatsByServerId(serverId);
    res.json({ deleted: count });
  } catch (err) {
    handleError('deleteStatChannels', err, res);
  }
}
