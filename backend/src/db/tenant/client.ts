import { PrismaClient } from './generated/client';
import { logger } from '../../config/logger';

// Connection pool cache: tenantId -> PrismaClient
const tenantPrismaCache = new Map<string, PrismaClient>();

// Maximum number of cached connections
const MAX_CACHED_CONNECTIONS = 50;

/**
 * Get or create a Prisma client for a specific tenant
 * Implements connection pooling to avoid creating too many connections
 */
export const getTenantPrisma = (tenantId: string, dbUrl: string): PrismaClient => {
  // Return cached client if exists
  if (tenantPrismaCache.has(tenantId)) {
    return tenantPrismaCache.get(tenantId)!;
  }

  // Check if we've reached the cache limit
  if (tenantPrismaCache.size >= MAX_CACHED_CONNECTIONS) {
    logger.warn(`Tenant Prisma cache limit reached (${MAX_CACHED_CONNECTIONS}). Consider increasing limit.`);
    // In production, you might want to implement LRU eviction here
  }

  // Create new Prisma client for this tenant
  const tenantPrisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Cache the client
  tenantPrismaCache.set(tenantId, tenantPrisma);

  logger.info(`✅ Tenant database connected: ${tenantId}`);

  return tenantPrisma;
};

/**
 * Disconnect a specific tenant's Prisma client
 */
export const disconnectTenantPrisma = async (tenantId: string) => {
  const client = tenantPrismaCache.get(tenantId);
  if (client) {
    await client.$disconnect();
    tenantPrismaCache.delete(tenantId);
    logger.info(`Tenant database disconnected: ${tenantId}`);
  }
};

/**
 * Disconnect all tenant Prisma clients (for graceful shutdown)
 */
export const disconnectAllTenantPrisma = async () => {
  const disconnectPromises = Array.from(tenantPrismaCache.entries()).map(
    async ([tenantId, client]) => {
      await client.$disconnect();
      logger.info(`Tenant database disconnected: ${tenantId}`);
    }
  );

  await Promise.all(disconnectPromises);
  tenantPrismaCache.clear();
  logger.info('All tenant databases disconnected');
};

/**
 * Get cache statistics (for monitoring)
 */
export const getTenantCacheStats = () => {
  return {
    cachedConnections: tenantPrismaCache.size,
    maxConnections: MAX_CACHED_CONNECTIONS,
    tenantIds: Array.from(tenantPrismaCache.keys()),
  };
};
