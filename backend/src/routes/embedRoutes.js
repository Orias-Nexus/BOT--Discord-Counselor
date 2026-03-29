import { Router } from 'express';
import * as embedController from '../controllers/embedController.js';
import { requirePermission } from '../middleware/authMiddleware.js';

const router = Router({ mergeParams: true });

router.use('/', requirePermission('manage_server'));

// Lấy danh sách embeds của server
router.get('/', embedController.listByServer);

// Lấy chi tiết một embed
router.get('/:embedId', embedController.getById);

// Tạo mới một embed
router.post('/', embedController.create);

// Cập nhật embed
router.patch('/:embedId', embedController.update);

// Xoá embed
router.delete('/:embedId', embedController.remove);

export default router;
