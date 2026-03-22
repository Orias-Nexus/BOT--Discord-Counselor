import { Router } from 'express';
import * as ctrl from '../controllers/levelController.js';

const router = Router();

router.get('/', ctrl.getAll);
router.get('/range', ctrl.getRange);
router.get('/progress', ctrl.getProgress);

export default router;
