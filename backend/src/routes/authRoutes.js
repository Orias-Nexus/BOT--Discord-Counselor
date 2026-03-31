import { Router } from 'express';
import { getDiscordLoginUrl, handleDiscordCallback, getMe } from '../controllers/authController.js';

const router = Router();

// /api/auth/discord
router.get('/discord', getDiscordLoginUrl);
router.get('/discord/callback', handleDiscordCallback);

// /api/auth/me — trả thông tin user từ JWT
router.get('/me', getMe);

export default router;
