import { Worker } from 'bullmq';
import { redisClient } from './redis.js';

export const initWorker = (client) => {
  const worker = new Worker('BotTasks', async (job) => {
    console.log(`[Worker] Nhận task: ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case 'renameChannel': {
        const { channelId, newName } = job.data;
        try {
          const channel = await client.channels.fetch(channelId);
          if (channel) {
            await channel.setName(newName);
            console.log(`[Worker] Đã đổi tên kênh ${channelId} thành ${newName}`);
          }
        } catch (error) {
          console.error(`[Worker] Lỗi đổi tên kênh ${channelId}:`, error);
        }
        break;
      }

      case 'sendMessage': {
        const { targetChannelId, content } = job.data;
        try {
          const channel = await client.channels.fetch(targetChannelId);
          if (channel && channel.isTextBased()) {
            await channel.send(content);
            console.log(`[Worker] Đã gửi tin nhắn đến kênh ${targetChannelId}`);
          }
        } catch (error) {
          console.error(`[Worker] Lỗi gửi tin nhắn kênh ${targetChannelId}:`, error);
        }
        break;
      }

      default:
        console.warn(`[Worker] Không có handler cho task type: ${job.name}`);
    }
  }, { connection: redisClient });

  worker.on('completed', (job) => {
    console.log(`[Worker] Task ${job.id} hoàn thành thành công`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Task ${job.id} bị lỗi:`, err.message);
  });

  return worker;
};
