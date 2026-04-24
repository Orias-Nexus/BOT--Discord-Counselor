import { Router } from 'express';
import * as ctrl from '../controllers/serverController.js';
import * as embedCtrl from '../controllers/embedController.js';
import * as infoCtrl from '../controllers/discordInfoController.js';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use('/:serverId', requirePermission('manage_server'));

router.get('/:serverId', ctrl.getServer);
router.get('/:serverId/stats', ctrl.getStats);
router.post('/:serverId/ensure', ctrl.ensureServer);
router.patch('/:serverId', ctrl.updateServer);
router.get('/:serverId/times', ctrl.getTimes);
router.patch('/:serverId/times', ctrl.setTimes);
router.patch('/:serverId/roles', ctrl.setRoles);
router.patch('/:serverId/unroles', ctrl.setUnroles);

router.get('/:serverId/discord-info', infoCtrl.getDiscordInfo);
router.get('/:serverId/discord-members', infoCtrl.listDiscordMembers);

router.get('/:serverId/embeds', embedCtrl.listByServer);
router.post('/:serverId/embeds', embedCtrl.create);
router.get('/:serverId/embeds/:embedId', embedCtrl.getById);
router.patch('/:serverId/embeds/:embedId', embedCtrl.update);
router.delete('/:serverId/embeds/:embedId', embedCtrl.remove);

export default router;
