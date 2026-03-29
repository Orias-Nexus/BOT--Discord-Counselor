import { Router } from 'express';
import * as ctrl from '../controllers/serverController.js';
import * as messageCtrl from '../controllers/messageController.js';
import * as embedCtrl from '../controllers/embedController.js';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Toàn bộ thao tác cấu hình server đều cần quyền manage_server
router.use('/:serverId', requirePermission('manage_server'));

router.get('/:serverId', ctrl.getServer);
router.post('/:serverId/ensure', ctrl.ensureServer);
router.patch('/:serverId', ctrl.updateServer);
router.get('/:serverId/times', ctrl.getTimes);
router.patch('/:serverId/times', ctrl.setTimes);
router.patch('/:serverId/roles', ctrl.setRoles);
router.patch('/:serverId/unroles', ctrl.setUnroles);

router.get('/:serverId/messages', messageCtrl.listByServer);
router.get('/:serverId/messages/:messagesType', messageCtrl.checkType, messageCtrl.getByType);
router.patch('/:serverId/messages/:messagesType/channel', messageCtrl.checkType, messageCtrl.setChannel);
router.patch('/:serverId/messages/:messagesType/embed', messageCtrl.checkType, messageCtrl.setEmbed);
router.get('/:serverId/embeds', embedCtrl.listByServer);
router.post('/:serverId/embeds', embedCtrl.create);
router.get('/:serverId/embeds/:embedId', embedCtrl.getById);
router.patch('/:serverId/embeds/:embedId', embedCtrl.update);
router.delete('/:serverId/embeds/:embedId', embedCtrl.remove);

export default router;
