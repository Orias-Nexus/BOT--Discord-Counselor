import 'dotenv/config';

const env = {
  isProd: process.env.NODE_ENV,
  nodeEnv: process.env.NODE_ENV,

  // Server port
  port: parseInt(process.env.PORT, 10),
  
  // Connection Secret Keys 
  authJwtSecret: process.env.AUTH_JWT_SECRET,
  internalSecret: process.env.INTERNAL_SECRET,

  // Discord Application Connection
  discordApplicationID: process.env.DISCORD_APPLICATION_ID,
  discordBotInviteUrl: process.env.DISCORD_BOT_INVITE_URL,
  discordRedirectUri: process.env.DISCORD_REDIRECT_URL,
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET,

  // Postgres Schema Url
  databasePoolerUrl: process.env.DATABASE_POOLER_URL,
  databaseDirectUrl: process.env.DATABASE_DIRECT_URL,

  // Domain Urls
  frontendHomeUrl: process.env.FRONTEND_HOME_URL,
  directiveApiUrl: process.env.DIRECTIVE_API_URL,
  redisStorageUrl: process.env.REDIS_STORAGE_URL,
};

// REQUIRED
const required = {
  AUTH_JWT_SECRET: env.authJwtSecret,
  INTERNAL_SECRET: env.internalSecret,

  DISCORD_APPLICATION_ID: env.discordApplicationID,
  DISCORD_BOT_INVITE_URL: env.discordBotInviteUrl,
  DISCORD_REDIRECT_URL: env.discordRedirectUri,
  DISCORD_CLIENT_SECRET: env.discordClientSecret,

  DATABASE_POOLER_URL: env.databasePoolerUrl,
  DATABASE_DIRECT_URL: env.databaseDirectUrl,

  FRONTEND_HOME_URL: env.frontendHomeUrl,
  DIRECTIVE_API_URL: env.directiveApiUrl,
  REDIS_STORAGE_URL: env.redisStorageUrl,
};

const missing = Object.entries(required)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length > 0) {
  console.error(`[config] Missing required env in production: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('[config] Environment:', env.nodeEnv);
console.log('[config] Port:', env.port);
console.log('[config] Redis:', env.redisStorageUrl);
console.log('[config] Frontend:', env.frontendHomeUrl);

export default env;
