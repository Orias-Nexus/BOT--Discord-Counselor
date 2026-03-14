import { Router } from 'express';
import * as ctrl from '../controllers/memberController.js';

const router = Router();

router.get('/level-range', ctrl.getLevelRange);
router.post('/process-expires', ctrl.processExpires);
router.get('/:serverId/:userId', ctrl.getMember);
router.patch('/:serverId/:userId/level', ctrl.setLevel);
router.patch('/:serverId/:userId/status', ctrl.setStatus);

export default router;
