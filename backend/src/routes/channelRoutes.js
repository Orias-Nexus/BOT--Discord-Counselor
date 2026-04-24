import { Router } from 'express';
import * as ctrl from '../controllers/channelController.js';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = Router({ mergeParams: true });

router.use('/', requirePermission('manage_server'));

router.get('/', ctrl.getChannels);
router.post('/', ctrl.upsertChannel);
router.delete('/stats', ctrl.deleteStatChannels);
router.delete('/:categoryId', ctrl.deleteChannel);

export default router;
