import { Router } from 'express';
import * as ctrl from '../controllers/memberController.js';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/level-range', ctrl.getLevelRange);
router.post('/process-expires', ctrl.processExpires);

router.get('/:serverId/leaderboard', requirePermission('manage_server'), ctrl.getLeaderboard);
router.get('/:serverId/:userId', requirePermission('manage_server'), ctrl.getMember);
router.get('/:serverId/:userId/rank', requirePermission('manage_server'), ctrl.getRank);

router.patch('/:serverId/:userId/level', requirePermission('moderate_member'), ctrl.setLevel);
router.patch('/:serverId/:userId/status', requirePermission('moderate_member'), ctrl.setStatus);
router.patch('/:serverId/:userId/exp', requirePermission('moderate_member'), ctrl.addExp);

export default router;
