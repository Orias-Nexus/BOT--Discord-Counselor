import Redis from 'ioredis';
import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Setup kết nối Redis chung
export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Khởi tạo hàng đợi đẩy task cho bot (bot sẽ consume queue này)
export const discordQueue = new Queue('BotTasks', { connection: redisClient });

export const publishBotTask = async (taskName, data) => {
  try {
    await discordQueue.add(taskName, data, {
      removeOnComplete: true, // Xoá task sau khi chạy xong
      removeOnFail: false // Giữ lại log lỗi
    });
    console.log(`Pushed task ${taskName} to Queue`);
  } catch (error) {
    console.error('Lỗi khi đẩy task vào Queue:', error);
  }
};
