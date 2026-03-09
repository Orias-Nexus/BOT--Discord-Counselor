import { PrismaClient } from '@prisma/client';

// Đảm bảo chỉ có 1 instance của Prisma trong môi trường server (kể cả HMR)
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
