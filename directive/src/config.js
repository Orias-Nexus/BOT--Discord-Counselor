/**
 * Config from env. BACKEND_API_URL defaults to http://localhost:4000.
 * mainImageURL from Architecture resource (embed image); override via MAIN_IMAGE_URL.
 */
const DEFAULT_MAIN_IMAGE_URL =
  'https://github.com/Orias1701/Resources--Discord-Bots/blob/main/img/pet.png?raw=true';

export const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? 'http://localhost:4000';

export const mainImageURL =
  process.env.MAIN_IMAGE_URL ?? DEFAULT_MAIN_IMAGE_URL;
