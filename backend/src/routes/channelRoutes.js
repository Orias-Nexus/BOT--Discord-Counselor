import { Router } from 'express';
import * as ctrl from '../controllers/channelController.js';

const router = Router({ mergeParams: true });

router.get('/', ctrl.getChannels);
router.post('/', ctrl.upsertChannel);
router.delete('/stats', ctrl.deleteStatChannels);

export default router;
