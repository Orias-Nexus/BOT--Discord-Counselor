import { Router } from 'express';
import * as ctrl from '../controllers/functionController.js';

const router = Router();

router.get('/script/:scriptName', ctrl.getByScript);
router.get('/slash', ctrl.getAllSlash);

export default router;
