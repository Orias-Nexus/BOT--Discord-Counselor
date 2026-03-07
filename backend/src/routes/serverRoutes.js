import { Router } from 'express';
import * as ctrl from '../controllers/serverController.js';

const router = Router();

router.get('/:serverId', ctrl.getServer);
router.post('/:serverId/ensure', ctrl.ensureServer);
router.patch('/:serverId', ctrl.updateServer);
router.get('/:serverId/times', ctrl.getTimes);
router.patch('/:serverId/times', ctrl.setTimes);
router.patch('/:serverId/roles', ctrl.setRoles);
router.patch('/:serverId/unroles', ctrl.setUnroles);

export default router;
