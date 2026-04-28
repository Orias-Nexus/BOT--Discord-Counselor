import jwt from 'jsonwebtoken';
import axios from 'axios';
import env from '../config/env.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import { getSession, touchSession } from '../utils/sessionStore.js';

const PERM_CACHE_TTL = 60;
const permKey = (serverId, userId, actionType) => `perm:${serverId}:${userId}:${actionType}`;

export const verifyAuth = async (req, res, next) => {
  const internalKey = req.headers['x-internal-key'];
  if (internalKey && internalKey === env.internalSecret) {
    req.user = { id: 'bot', isBot: true };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.authJwtSecret);

    // Backward compatibility: nếu JWT cũ còn mang discordAccessToken thì accept.
    if (decoded.sid) {
      const session = await getSession(decoded.sid);
      if (!session) {
        return res.status(401).json({ error: 'Session revoked', expired: true });
      }
      touchSession(decoded.sid).catch(() => {});
      req.user = {
        id: session.userId,
        sub: session.userId,
        username: session.username,
        avatar: session.avatar,
        sid: decoded.sid,
      };
    } else {
      req.user = {
        id: decoded.id || decoded.sub,
        sub: decoded.id || decoded.sub,
        username: decoded.username,
        avatar: decoded.avatar,
      };
    }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', expired: true });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const MAX_PERM_RETRIES = 2;
const PERM_RETRY_DELAY_MS = 1500;

function isConnectionError(err) {
  const code = err?.code;
  const name = err?.name;
  return name === 'AggregateError' || code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'ENOTFOUND';
}

async function callCheckPermission(payload) {
  return axios.post(`${env.directiveApiUrl}/internal/check-permission`, payload, {
    headers: { 'x-internal-key': env.internalSecret },
    timeout: 5000,
  });
}

export const requirePermission = (actionType) => {
  return async (req, res, next) => {
    try {
      if (req.user && req.user.isBot) return next();

      const body = req.body ?? {};
      const serverId = req.params.serverId || body.serverId;
      const targetId = req.params.userId || body.targetId || body.channelId || null;
      const userId = req.user.id;

      if (!serverId) return res.status(400).json({ error: 'Missing serverId in request' });

      const cacheKey = permKey(serverId, userId, actionType) + (targetId ? `:${targetId}` : '');
      const cached = await cacheGet(cacheKey);
      if (cached) {
        if (cached.allow) return next();
        return res.status(403).json({ error: `Forbidden: ${cached.reason || 'No permission'}` });
      }

      const payload = { serverId, userId, actionType, targetId };
      let response;
      let lastErr;
      for (let attempt = 0; attempt <= MAX_PERM_RETRIES; attempt++) {
        try {
          response = await callCheckPermission(payload);
          break;
        } catch (err) {
          lastErr = err;
          if (attempt < MAX_PERM_RETRIES && isConnectionError(err)) {
            await new Promise((r) => setTimeout(r, PERM_RETRY_DELAY_MS));
            continue;
          }
          throw err;
        }
      }

      if (!response) throw lastErr;

      const hasPermission = response.data?.hasPermission === true;
      const reason = response.data?.error || 'No permission on Discord';

      await cacheSet(cacheKey, { allow: hasPermission, reason }, PERM_CACHE_TTL);

      if (hasPermission) return next();
      return res.status(403).json({ error: `Forbidden: ${reason}` });
    } catch (err) {
      const detail =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        String(err);
      console.error('[authMiddleware] check-permission failed:', detail);
      return res.status(503).json({ error: 'Permission service unavailable' });
    }
  };
};
