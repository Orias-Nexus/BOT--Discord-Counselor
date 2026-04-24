import { Router } from 'express';
import {
  getDiscordLoginUrl,
  handleDiscordCallback,
  getMe,
  getGuilds,
  refreshGuilds,
  logout,
  getBotInviteUrl,
} from '../controllers/authController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/discord', getDiscordLoginUrl);
router.get('/discord/callback', handleDiscordCallback);

router.get('/me', verifyAuth, getMe);
router.get('/guilds', verifyAuth, getGuilds);
router.get('/bot-invite', verifyAuth, getBotInviteUrl);
router.post('/guilds/refresh', verifyAuth, refreshGuilds);
router.post('/logout', verifyAuth, logout);

export default router;
