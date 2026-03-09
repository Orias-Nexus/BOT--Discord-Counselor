import { Router } from 'express';
import * as messageController from '../controllers/messageController.js';

const router = Router({ mergeParams: true });

// Lấy danh sách messages của server
router.get('/', messageController.listByServer);

// Xem 1 type cấu hình (có validate valid types trước)
router.get('/:messagesType', messageController.checkType, messageController.getByType);

// Cập nhật cấu hình kênh cho loại message này (trả json body channel_id)
router.patch('/:messagesType/channel', messageController.checkType, messageController.setChannel);

// Cập nhật cấu hình embed cho loại message này (trả json body embed_id)
router.patch('/:messagesType/embed', messageController.checkType, messageController.setEmbed);

export default router;
