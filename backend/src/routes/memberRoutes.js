import { Router } from 'express';
import * as ctrl from '../controllers/memberController.js';

const router = Router();

router.get('/level-range', ctrl.getLevelRange);
router.post('/process-expires', ctrl.processExpires);
router.get('/:serverId/leaderboard', ctrl.getLeaderboard);
router.get('/:serverId/:userId', ctrl.getMember);
router.get('/:serverId/:userId/rank', ctrl.getRank);
router.patch('/:serverId/:userId/level', ctrl.setLevel);
router.patch('/:serverId/:userId/status', ctrl.setStatus);
router.patch('/:serverId/:userId/exp', ctrl.addExp);

export default router;
