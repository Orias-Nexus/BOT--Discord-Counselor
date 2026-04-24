import { Router } from 'express';
import * as messageController from '../controllers/messageController.js';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = Router({ mergeParams: true });

router.use('/', requirePermission('manage_server'));

router.get('/', messageController.listByServer);
router.post('/send', messageController.sendMessage);
router.get('/:messagesType', messageController.checkType, messageController.getByType);
router.patch('/:messagesType/channel', messageController.checkType, messageController.setChannel);
router.patch('/:messagesType/embed', messageController.checkType, messageController.setEmbed);
router.post('/:messagesType/test', messageController.checkType, messageController.testMessage);

export default router;
