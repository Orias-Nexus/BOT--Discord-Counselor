/**
 * Health Check Service — kiểm tra trạng thái Database, Redis, và hệ thống.
 * Dùng cho endpoint /health (chi tiết) và monitoring bên ngoài.
 */
import { prisma } from '../config/prisma.js';
import { redisClient } from './redis.js';

const startedAt = new Date();

/**
 * Ping database: chạy query `SELECT 1` qua Prisma.
 * @returns {{ status: string, latencyMs: number }}
 */
async function checkDatabase() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', latencyMs: Date.now() - start, error: err.message };
  }
}

/**
 * Ping Redis: gửi lệnh PING, bắt buộc trả 'PONG'.
 * @returns {{ status: string, latencyMs: number }}
 */
async function checkRedis() {
  const start = Date.now();
  try {
    const reply = await redisClient.ping();
    return { status: reply === 'PONG' ? 'ok' : 'degraded', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', latencyMs: Date.now() - start, error: err.message };
  }
}

/**
 * Tổng hợp kết quả health check.
 * @returns {Promise<{status: string, uptime: number, timestamp: string, services: Object, system: Object}>}
 */
export async function getHealthStatus() {
  const [db, redis] = await Promise.all([checkDatabase(), checkRedis()]);

  const mem = process.memoryUsage();
  const overallStatus = (db.status === 'ok' && redis.status === 'ok') ? 'healthy'
    : (db.status === 'error' || redis.status === 'error') ? 'unhealthy'
    : 'degraded';

  return {
    status: overallStatus,
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startedAt.getTime()) / 1000),
    startedAt: startedAt.toISOString(),
    timestamp: new Date().toISOString(),
    services: { database: db, redis },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: `${(mem.rss / 1024 / 1024).toFixed(1)} MB`,
        heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`,
        heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)} MB`,
      },
      pid: process.pid,
    },
  };
}
