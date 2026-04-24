import * as channelService from '../services/channelService.js';
import { normalizeError } from '../utils/errorUtils.js';
import { checkFeatureLimit } from '../utils/features.js';
import { dispatchAction, DISCORD_ACTION_JOBS } from '../utils/queue.js';

function handleError(prefix, err, res) {
  const { status, message } = normalizeError(err);
  if (status === 503) console.warn(`[channelController] ${prefix}: DB 503`);
  else console.error(`[channelController] ${prefix}:`, err);
  res.status(status).json({ error: message });
}

export async function getChannels(req, res) {
  try {
    const { serverId } = req.params;
    const { type } = req.query;
    const list = await channelService.listByServer(serverId, type || null);
    res.json(list);
  } catch (err) { handleError('getChannels', err, res); }
}

/**
 * POST /:serverId/channels — upsert config + (nếu yêu cầu) dispatch job tạo thật trên Discord.
 * body: { category_id?, category_type, channels_idx, create?: boolean }
 */
export async function upsertChannel(req, res) {
  try {
    const { serverId } = req.params;
    const { category_id: categoryId, category_type: categoryType, channels_idx: channelsIdx, create } = req.body || {};
    if (!categoryType) return res.status(400).json({ error: 'category_type required' });

    if (create && !categoryId) {
      // Chưa có category trên Discord -> dispatch tạo mới.
      await checkFeatureLimit(
        serverId,
        categoryType === 'Stats' ? 'set_server_stats_limit' : 'set_voice_creator_limit',
      );
      const jobName = categoryType === 'Stats'
        ? DISCORD_ACTION_JOBS.CHANNEL_CREATE_STATS
        : DISCORD_ACTION_JOBS.CHANNEL_CREATE_VOICE_CREATOR;
      const job = await dispatchAction(jobName, {
        serverId,
        actorId: req.user?.id ?? null,
        meta: { channelsIdx: channelsIdx ?? 0 },
      });
      return res.status(202).json(job);
    }

    if (!categoryId) return res.status(400).json({ error: 'category_id required when create=false' });

    const existing = await channelService.getByCategoryId(categoryId);
    if (!existing) {
      await checkFeatureLimit(
        serverId,
        categoryType === 'Stats' ? 'set_server_stats_limit' : 'set_voice_creator_limit',
      );
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
  } catch (err) { handleError('deleteStatChannels', err, res); }
}

/** DELETE /:serverId/channels/:categoryId — delete channel via worker */
export async function deleteChannel(req, res) {
  try {
    const { serverId, categoryId } = req.params;
    const job = await dispatchAction(DISCORD_ACTION_JOBS.CHANNEL_DELETE, {
      serverId,
      actorId: req.user?.id ?? null,
      meta: { categoryId },
    });
    res.status(202).json(job);
  } catch (err) { handleError('deleteChannel', err, res); }
}
