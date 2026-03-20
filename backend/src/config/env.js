import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

const env = {
  isProd,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,

  // Discord OAuth
  discordClientId: process.env.DISCORD_CLIENT_ID || '',
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  discordRedirectUri:
    process.env.DISCORD_REDIRECT_URI ||
    (isProd
      ? 'http://orias-counselor.duckdns.org:4000/api/auth/discord/callback'
      : 'http://localhost:4000/api/auth/discord/callback'),

  jwtSecret: process.env.JWT_SECRET || 'super-secret-key-123',

  // Database (Prisma reads POOLER_URL / DIRECT_URL directly from env)
  poolerUrl: process.env.POOLER_URL || '',
  directUrl: process.env.DIRECT_URL || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // CORS
  frontendOrigin:
    process.env.FRONTEND_ORIGIN ||
    (isProd ? 'https://your-frontend-domain.com' : 'http://localhost:3000'),
};

if (!isProd) {
  console.log('[config] Environment:', env.nodeEnv);
  console.log('[config] Port:', env.port);
  console.log('[config] Redis:', env.redisUrl);
  console.log('[config] Frontend:', env.frontendOrigin);
}

export default env;
