import { Router } from 'express';
import { getDiscordLoginUrl, handleDiscordCallback } from '../controllers/authController.js';

const router = Router();

// /api/auth/discord
router.get('/discord', getDiscordLoginUrl);
router.get('/discord/callback', handleDiscordCallback);

export default router;
