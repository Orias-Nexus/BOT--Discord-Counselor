import { Router } from 'express';
import * as ctrl from '../controllers/userController.js';

const router = Router();

router.get('/leaderboard', ctrl.getLeaderboard);
router.get('/:userId', ctrl.getUser);
router.get('/:userId/rank', ctrl.getRank);
router.patch('/:userId/exp', ctrl.addExp);

export default router;
