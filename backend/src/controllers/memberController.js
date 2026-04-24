import * as memberService from '../services/memberService.js';
import * as serverService from '../services/serverService.js';
import axios from 'axios';
import env from '../config/env.js';
import { normalizeError } from '../utils/errorUtils.js';
import { dispatchAction, DISCORD_ACTION_JOBS } from '../utils/queue.js';

function handleError(prefix, err, res) {
  const { status, message } = normalizeError(err);
  if (status === 503) console.warn(`[memberController] ${prefix}: DB 503`);
  else console.error(`[memberController] ${prefix}:`, err);
  res.status(status).json({ error: message });
}

async function fetchDiscordMemberMap(serverId, limit = 100) {
  try {
    const { data } = await axios.get(`${env.directiveApiUrl}/internal/guild/${serverId}/members`, {
      params: { limit: Math.min(limit, 100) },
      headers: { 'x-internal-key': env.internalSecretKey },
      timeout: 5000,
    });
    const members = Array.isArray(data?.members) ? data.members : [];
    return new Map(members.map((m) => [m.id, m]));
  } catch (err) {
    console.warn('[memberController] fetchDiscordMemberMap failed:', err.message);
    return new Map();
  }
}

function enrichMember(member, memberMap) {
  if (!member) return member;
  const discord = memberMap.get(member.user_id);
  if (!discord) return member;
  return {
    ...member,
    username: discord.username ?? null,
    display_name: discord.displayName ?? null,
    avatar: discord.avatar ?? null,
    bot: discord.bot === true,
  };
}

export async function getMember(req, res) {
  try {
    const { serverId, userId } = req.params;
    await serverService.ensureServer(serverId);
    let member = await memberService.getMember(serverId, userId);
    if (!member) member = await memberService.ensureMember(serverId, userId);
    const memberMap = await fetchDiscordMemberMap(serverId, 100);
    res.json(enrichMember(member, memberMap));
  } catch (err) { handleError('getMember', err, res); }
}

export async function setLevel(req, res) {
  try {
    const { serverId, userId } = req.params;
    const { level } = req.body || {};
    await serverService.ensureServer(serverId);
    const member = await memberService.setMemberLevel(serverId, userId, Number(level));
    if (!member) return res.status(400).json({ error: 'Invalid level' });
    res.json(member);
  } catch (err) { handleError('setLevel', err, res); }
}

/**
 * PATCH /members/:serverId/:userId/status body { status, expiresAt, dispatch? }
 * Mặc định dispatch = true -> enqueue Discord action tương ứng.
 */
export async function setStatus(req, res) {
  try {
    const { serverId, userId } = req.params;
    const { status, expiresAt, dispatch = true } = req.body || {};
    await serverService.ensureServer(serverId);

    let job = null;
    if (dispatch) {
      const jobName = {
        Good: DISCORD_ACTION_JOBS.MEMBER_RESET,
        Warn: DISCORD_ACTION_JOBS.MEMBER_WARN,
        Mute: DISCORD_ACTION_JOBS.MEMBER_MUTE,
        Lock: DISCORD_ACTION_JOBS.MEMBER_LOCK,
        Kick: DISCORD_ACTION_JOBS.MEMBER_KICK,
      }[status];
      if (jobName) {
        const durationMs = expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : null;
        job = await dispatchAction(jobName, {
          serverId,
          actorId: req.user?.id ?? null,
          targetId: userId,
          meta: durationMs != null ? { durationMs } : {},
        });
      }
    }

    const member = await memberService.setMemberStatus(serverId, userId, status, expiresAt);
    res.json({ member, job });
  } catch (err) { handleError('setStatus', err, res); }
}

export async function getLevelRange(_req, res) {
  try {
    const range = await memberService.getLevelRange();
    res.json(range);
  } catch (err) { handleError('getLevelRange', err, res); }
}

export async function addExp(req, res) {
  try {
    const { serverId, userId } = req.params;
    const { exp } = req.body || {};
    if (!exp || exp <= 0) return res.status(400).json({ error: 'exp must be positive' });
    await serverService.ensureServer(serverId);
    await memberService.ensureMember(serverId, userId);
    const result = await memberService.addMemberExp(serverId, userId, Number(exp));
    if (!result) return res.status(400).json({ error: 'Failed to add exp' });
    res.json(result);
  } catch (err) { handleError('addExp', err, res); }
}

export async function getLeaderboard(req, res) {
  try {
    const { serverId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const data = await memberService.getMemberLeaderboard(serverId, limit);
    const memberMap = await fetchDiscordMemberMap(serverId, limit);
    res.json(data.map((row) => enrichMember(row, memberMap)));
  } catch (err) { handleError('getLeaderboard', err, res); }
}

export async function getRank(req, res) {
  try {
    const { serverId, userId } = req.params;
    const rank = await memberService.getMemberRank(serverId, userId);
    res.json({ rank });
  } catch (err) { handleError('getRank', err, res); }
}

export async function processExpires(_req, res) {
  try {
    const result = await memberService.processExpiredMembers();
    res.json(result);
  } catch (err) { handleError('processExpires', err, res); }
}

/**
 * POST /members/:serverId/:userId/action body { action, meta }
 * action: kick|mute|warn|lock|move|reset|timeout|role_apply|role_remove
 */
export async function dispatchMemberAction(req, res) {
  try {
    const { serverId, userId } = req.params;
    const { action, meta = {} } = req.body || {};
    const MAP = {
      kick: DISCORD_ACTION_JOBS.MEMBER_KICK,
      mute: DISCORD_ACTION_JOBS.MEMBER_MUTE,
      warn: DISCORD_ACTION_JOBS.MEMBER_WARN,
      lock: DISCORD_ACTION_JOBS.MEMBER_LOCK,
      move: DISCORD_ACTION_JOBS.MEMBER_MOVE,
      reset: DISCORD_ACTION_JOBS.MEMBER_RESET,
      timeout: DISCORD_ACTION_JOBS.MEMBER_TIMEOUT,
      role_apply: DISCORD_ACTION_JOBS.MEMBER_ROLE_APPLY,
      role_remove: DISCORD_ACTION_JOBS.MEMBER_ROLE_REMOVE,
    };
    const jobName = MAP[action];
    if (!jobName) return res.status(400).json({ error: `Invalid action: ${action}` });

    const job = await dispatchAction(jobName, {
      serverId,
      actorId: req.user?.id ?? null,
      targetId: userId,
      meta,
    });
    res.status(202).json(job);
  } catch (err) { handleError('dispatchMemberAction', err, res); }
}
