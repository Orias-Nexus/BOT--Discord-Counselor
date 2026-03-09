import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`New WebSocket connection: ${socket.id}`);

    // Cho phép client join vào room của từng server để nhận sự kiện riêng rẽ
    socket.on('join_server', (serverId) => {
      socket.join(serverId);
      console.log(`Socket ${socket.id} joined server room ${serverId}`);
    });

    socket.on('disconnect', () => {
      console.log(`WebSocket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Hàm helper để các API Controller có thể gọi và push sự kiện xuống client
export const emitEvent = (eventName, data, serverId = null) => {
  if (!io) return;
  if (serverId) {
    // Chỉ gửi cho màn hình Dashboard nào đang mở serverId đó
    io.to(serverId).emit(eventName, data);
  } else {
    // Broadcast toàn mạng
    io.emit(eventName, data);
  }
};
