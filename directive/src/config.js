import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

export const BACKEND_API_URL =
  process.env.BACKEND_API_URL ??
  (isProd
    ? 'https://orias-counselor.duckdns.org:4000/api'
    : 'http://localhost:4000/api');

export const REDIS_URL =
  process.env.REDIS_URL ?? (isProd ? '' : 'redis://localhost:6379');

const isLocalBackend =
  !BACKEND_API_URL ||
  BACKEND_API_URL.includes('localhost') ||
  BACKEND_API_URL.includes('127.0.0.1');

const GITHUB_RAW_WHITEPET =
  'https://github.com/Orias1701/Resources--Discord-Bots/blob/main/assets/img/Banner-Blank.png?raw=true';

const DEFAULT_MAIN_IMAGE_URL = isLocalBackend
  ? GITHUB_RAW_WHITEPET
  : `${BACKEND_API_URL.replace(/\/api$/, '')}/assets/images/Banner-Blank.png`;

export const mainImageUrl =
  process.env.MAIN_IMAGE_URL ?? DEFAULT_MAIN_IMAGE_URL;

const env = {
  isProd,
  nodeEnv: process.env.NODE_ENV || 'development',
  discordToken: process.env.DISCORD_TOKEN || '',
  applicationId: process.env.APPLICATION_ID || '',
  backendApiUrl: BACKEND_API_URL,
  redisUrl: REDIS_URL,
  mainImageUrl,
};

if (!isProd) {
  console.log('[config] Environment:', env.nodeEnv);
  console.log('[config] Backend API:', env.backendApiUrl);
  console.log('[config] Redis:', env.redisUrl);
  console.log('[config] Main Image:', env.mainImageUrl);
}

export default env;
