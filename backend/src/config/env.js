import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

const env = {
  isProd,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,

  discordClientId: process.env.APPLICATION_ID || '',
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  discordBotInviteUrl: process.env.DISCORD_BOT_INVITE_URL || '',
  discordRedirectUri:
    process.env.DISCORD_REDIRECT_URI ||
    (isProd
      ? 'https://orias-counselor.duckdns.org/api/auth/discord/callback'
      : 'http://localhost:4000/api/auth/discord/callback'),

  jwtSecret: process.env.AUTH_JWT_SECRET || 'super-secret-key-123',
  internalSecretKey: process.env.INTERNAL_SECRET_KEY || 'default-internal-secret',
  directiveApiUrl: process.env.DIRECTIVE_API_URL || (isProd ? 'http://directive:4001' : 'http://127.0.0.1:4001'),

  poolerUrl: process.env.POOLER_URL || '',
  directUrl: process.env.DIRECT_URL || '',

  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  frontendOrigin:
    process.env.FRONTEND_ORIGIN ||
    (isProd ? 'https://orias-counselor.duckdns.org' : 'http://localhost:3000'),
};

// Fail-fast: production không thể khởi động thiếu biến quan trọng.
if (isProd) {
  const required = {
    APPLICATION_ID: env.discordClientId,
    DISCORD_CLIENT_SECRET: env.discordClientSecret,
    AUTH_JWT_SECRET: env.jwtSecret === 'super-secret-key-123' ? '' : env.jwtSecret,
    INTERNAL_SECRET_KEY:
      env.internalSecretKey === 'default-internal-secret' ? '' : env.internalSecretKey,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    console.error(`[config] Missing required env in production: ${missing.join(', ')}`);
    process.exit(1);
  }
}

if (!isProd) {
  console.log('[config] Environment:', env.nodeEnv);
  console.log('[config] Port:', env.port);
  console.log('[config] Redis:', env.redisUrl);
  console.log('[config] Frontend:', env.frontendOrigin);
}

export default env;
