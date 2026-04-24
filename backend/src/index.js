import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import { logger } from './utils/logger.js';
import './utils/redis.js';
import './utils/queue.js';
import { initSocket } from './utils/socket.js';
import { getHealthStatus } from './utils/health.js';
import { monitoringMiddleware, getMetrics } from './utils/monitoring.js';
import { errorHandler, notFoundHandler } from './utils/errorHandler.js';

import serverRoutes from './routes/serverRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { verifyAuth } from './middleware/authMiddleware.js';
import { listVariables } from './controllers/variablesController.js';
import * as userCtrl from './controllers/userController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

initSocket(httpServer);

app.set('trust proxy', 1);
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(monitoringMiddleware);
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, slow down.' },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

app.get('/health', async (_req, res) => {
  const health = await getHealthStatus();
  const httpStatus = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
  res.status(httpStatus).json(health);
});

app.get('/api/metrics', (_req, res) => res.json(getMetrics()));

app.get('/api/info', (_req, res) => {
  res.json({
    name: 'Discord Counselor API',
    version: '2.0.0',
    endpoints: [
      '/health',
      '/api/info',
      '/api/auth/discord',
      '/api/variables',
      '/api/leaderboard/global',
      '/api/servers',
      '/api/servers/:serverId/discord-info',
      '/api/servers/:serverId/discord-members',
      '/api/servers/:serverId/channels',
      '/api/servers/:serverId/embeds',
      '/api/servers/:serverId/messages',
      '/api/members',
      '/api/users',
      '/api/levels',
    ],
  });
});

app.use('/api/auth', authLimiter, authRoutes);

app.use('/api', apiLimiter, verifyAuth);

app.get('/api/variables', listVariables);
app.get('/api/leaderboard/global', userCtrl.getLeaderboard);

app.use('/api/servers/:serverId/channels', channelRoutes);
app.use('/api/servers/:serverId/messages', messageRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

httpServer.listen(env.port, () => {
  console.log(`Backend API running at http://localhost:${env.port} [${env.nodeEnv}]`);
  console.log(`[startup] API base: http://localhost:${env.port}/api`);
  console.log(`[startup] Health:   http://localhost:${env.port}/health`);
  console.log(`[startup] FRONTEND_ORIGIN: ${env.frontendOrigin}`);
  console.log(`[startup] DISCORD_REDIRECT_URI: ${env.discordRedirectUri}`);
  console.log(`[startup] REDIS_URL: ${env.redisUrl || '(not set)'}`);
});

export { app, httpServer, logger };
