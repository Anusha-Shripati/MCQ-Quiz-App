import { logger } from '../config/logger';
import { getPrisma, disconnectPrisma } from './prisma/client';
import { disconnectAllTenantPrisma } from './tenant/client';

// Export platform prisma as default
export const prisma = getPrisma();

/**
 * Connect to platform database
 * Tenant databases are connected on-demand via tenant resolver
 */
async function connectToDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Platform database connected successfully!');
    logger.info('ℹ️  Tenant databases will connect on-demand');
  } catch (error) {
    logger.error('❌ Failed to connect to platform database:', error);
    throw error;
  }
}

/**
 * Disconnect all databases (for graceful shutdown)
 */
export async function disconnectFromDatabase() {
  try {
    await disconnectPrisma();
    await disconnectAllTenantPrisma();
    logger.info('✅ All databases disconnected');
  } catch (error) {
    logger.error('❌ Failed to disconnect databases:', error);
  }
}

export { connectToDatabase };
