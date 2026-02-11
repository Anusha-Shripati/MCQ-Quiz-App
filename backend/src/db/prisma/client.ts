import { PrismaClient } from './generated/client';
import { logger } from '../../config/logger';

let prisma: PrismaClient;

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    prisma.$connect()
      .then(() => logger.info('✅ Platform database connected'))
      .catch((error) => logger.error('❌ Platform database connection failed:', error));
  }

  return prisma;
};

export const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Platform database disconnected');
  }
};

// Default export for backward compatibility
export { prisma };
