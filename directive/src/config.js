/**
 * Config from env. BACKEND_API_URL defaults to http://localhost:4000.
 * mainImageURL: ảnh embed (Discord cần URL). Khi chạy local dùng GitHub raw (Discord không tải được localhost).
 */
export const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? 'http://localhost:4000';

const isLocalBackend =
  !BACKEND_API_URL ||
  BACKEND_API_URL.includes('localhost') ||
  BACKEND_API_URL.startsWith('127.0.0.1');

const GITHUB_RAW_WHITEPET =
  'https://github.com/Orias-Nexus/JS-Discord-Counselor/blob/main/assets/images/Whitepet.png?raw=true';

const DEFAULT_MAIN_IMAGE_URL = isLocalBackend
  ? GITHUB_RAW_WHITEPET
  : `${BACKEND_API_URL}/assets/images/Whitepet.png`;

export const mainImageURL =
  process.env.MAIN_IMAGE_URL ?? DEFAULT_MAIN_IMAGE_URL;
