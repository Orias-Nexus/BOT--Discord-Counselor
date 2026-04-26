import 'dotenv/config';
import { blank_banner } from './customs/handlers/placeholders/links.js';

const isProd = process.env.NODE_ENV === 'production';
const domainUrl = 'https://orias-counselor.duckdns.org/api';
const localUrl = 'http://127.0.0.1:4000/api';
const redisUrl = 'redis://127.0.0.1:6379';

export const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? (isProd ? domainUrl : localUrl);

export const REDIS_URL =
  process.env.REDIS_URL ?? redisUrl;

const isLocalBackend =
  !BACKEND_API_URL ||
  BACKEND_API_URL.includes('localhost') ||
  BACKEND_API_URL.includes('127.0.0.1');

const DEFAULT_MAIN_IMAGE_URL = isLocalBackend
  ? blank_banner()
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
  internalSecretKey: process.env.INTERNAL_SECRET_KEY || 'default-internal-secret',
};

if (!isProd) {
  console.log('[config] Environment:', env.nodeEnv);
  console.log('[config] Backend API:', env.backendApiUrl);
  console.log('[config] Redis:', env.redisUrl);
  console.log('[config] Main Image:', env.mainImageUrl);
}

export default env;
