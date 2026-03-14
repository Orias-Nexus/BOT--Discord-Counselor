import * as serverService from '../services/serverService.js';
import { normalizeError } from '../utils/errorUtils.js';

function handleError(prefix, err, res) {
  const { status, message } = normalizeError(err);
  if (status === 503) {
    console.warn(`[serverController] ${prefix}: database 502/503`, err?.message?.slice(0, 80));
  } else {
    console.error(`[serverController] ${prefix}:`, err);
  }
  res.status(status).json({ error: message });
}

export async function getServer(req, res) {
  try {
    const { serverId } = req.params;
    const server = await serverService.getServer(serverId);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    res.json(server);
  } catch (err) {
    handleError('getServer', err, res);
  }
}

export async function ensureServer(req, res) {
  try {
    const { serverId } = req.params;
    const server = await serverService.ensureServer(serverId);
    res.json(server);
  } catch (err) {
    handleError('ensureServer', err, res);
  }
}

export async function updateServer(req, res) {
  try {
    const { serverId } = req.params;
    const body = req.body || {};
    await serverService.ensureServer(serverId);
    if (body.time_warn !== undefined || body.time_mute !== undefined || body.time_lock !== undefined || body.time_new !== undefined) {
      await serverService.setTimes(serverId, {
        time_warn: body.time_warn,
        time_mute: body.time_mute,
        time_lock: body.time_lock,
        time_new: body.time_new,
      });
    }
    if (body.role_warn !== undefined || body.role_mute !== undefined || body.role_lock !== undefined || body.role_new !== undefined) {
      await serverService.setRoles(serverId, {
        role_warn: body.role_warn,
        role_mute: body.role_mute,
        role_lock: body.role_lock,
        role_new: body.role_new,
      });
    }
    if (body.unrole_mute !== undefined || body.unrole_lock !== undefined) {
      await serverService.setUnroles(serverId, { unrole_mute: body.unrole_mute, unrole_lock: body.unrole_lock });
    }
    const updated = await serverService.getServer(serverId);
    res.json(updated);
  } catch (err) {
    handleError('updateServer', err, res);
  }
}

export async function getTimes(req, res) {
  try {
    const { serverId } = req.params;
    const times = await serverService.getTimes(serverId);
    res.json(times);
  } catch (err) {
    handleError('getTimes', err, res);
  }
}

export async function setTimes(req, res) {
  try {
    const { serverId } = req.params;
    const { time_warn, time_mute, time_lock, time_new } = req.body || {};
    const server = await serverService.setTimes(serverId, { time_warn, time_mute, time_lock, time_new });
    res.json(server);
  } catch (err) {
    handleError('setTimes', err, res);
  }
}

export async function setRoles(req, res) {
  try {
    const { serverId } = req.params;
    const { role_warn, role_mute, role_lock, role_new } = req.body || {};
    const server = await serverService.setRoles(serverId, { role_warn, role_mute, role_lock, role_new });
    res.json(server);
  } catch (err) {
    handleError('setRoles', err, res);
  }
}

export async function setUnroles(req, res) {
  try {
    const { serverId } = req.params;
    const { unrole_mute, unrole_lock } = req.body || {};
    const server = await serverService.setUnroles(serverId, { unrole_mute, unrole_lock });
    res.json(server);
  } catch (err) {
    handleError('setUnroles', err, res);
  }
}
