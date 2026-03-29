import jwt from 'jsonwebtoken';
import axios from 'axios';
import env from '../config/env.js';

/**
 * 1. Lọc và xác thực JWT
 */
export const verifyAuth = (req, res, next) => {
  const internalKey = req.headers['x-internal-key'];
  if (internalKey && internalKey === env.internalSecretKey) {
    req.user = { id: 'bot', isBot: true };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded; // { id, username, avatar, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', expired: true });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * 2. Gọi API Nội bộ của Directive để Check Quyền hạn chi tiết
 * @param {string} actionType - Kiểu thao tác: 'manage_server', 'manage_channel', 'moderate_member'
 */
export const requirePermission = (actionType) => {
  return async (req, res, next) => {
    try {
      if (req.user && req.user.isBot) {
        return next();
      }

      const serverId = req.params.serverId || req.body.serverId;
      const targetId = req.params.userId || req.body.targetId || req.body.channelId || null;
      const userId = req.user.id;

      if (!serverId) {
        return res.status(400).json({ error: 'Missing serverId in request' });
      }

      // Gọi nội bộ qua cổng HTTP nhỏ của Bot Directive (Internal API)
      const response = await axios.post(`${env.directiveApiUrl}/internal/check-permission`, {
        serverId,
        userId,
        actionType,
        targetId
      });

      if (response.data && response.data.hasPermission) {
        return next();
      }

      const reason = response.data?.error || 'No permission on Discord';
      return res.status(403).json({ error: `Forbidden: ${reason}` });

    } catch (err) {
      console.error('[authMiddleware] check-permission failed:', err.message);
      return res.status(500).json({ error: 'Internal server error while checking permissions' });
    }
  };
};
