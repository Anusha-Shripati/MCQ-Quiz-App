import { Request, Response, NextFunction } from 'express';
import { PrismaClient as PlatformPrismaClient } from '../db/prisma/generated/client';
import { PrismaClient as TenantPrismaClient } from '../db/tenant/generated/client';
import { getPrisma } from '../db/prisma/client';
import { getTenantPrisma } from '../db/tenant/client';
import { generateResponse } from '../utils/generateResponse';
import { logger } from '../config/logger';

/**
 * Extract subdomain from hostname
 * Examples:
 *   - abc.lr-mcq.com -> abc
 *   - admin.lr-mcq.com -> admin
 *   - localhost:3001 -> localhost (for development)
 */
const extractSubdomain = (hostname: string): string => {
  // Handle localhost for development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return process.env.DEV_TENANT_SLUG || 'localhost';
  }

  // Extract subdomain from hostname
  const parts = hostname.split('.');
  
  // If hostname has at least 3 parts (subdomain.domain.tld)
  if (parts.length >= 3) {
    return parts[0];
  }

  // Default to first part
  return parts[0];
};

/**
 * Tenant Resolver Middleware
 * 
 * Resolves tenant from subdomain and injects tenant context into request
 * This middleware should be applied to all tenant routes (not platform routes)
 */
export const tenantResolver = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hostname = req.hostname;
    const subdomain = extractSubdomain(hostname);

    logger.info(`Tenant resolution: hostname=${hostname}, subdomain=${subdomain}`);

    // Check if this is a platform admin request
    if (subdomain === 'admin') {
      generateResponse(
        res,
        400,
        {},
        false,
        'Platform admin routes should not use tenant resolver. Use /platform/* routes instead.'
      );
      return;
    }

    // Get platform database to lookup tenant
    const platformPrisma = getPrisma();

    // Lookup tenant by slug (subdomain)
    const tenant = await platformPrisma.tenants.findUnique({
      where: { 
        slug: subdomain,
        deleted_at: null 
      },
      include: {
        plan: true,
      },
    });

    // Tenant not found
    if (!tenant) {
      logger.warn(`Tenant not found: ${subdomain}`);
      generateResponse(
        res,
        404,
        { subdomain },
        false,
        'Organization not found. Please check your URL.'
      );
      return;
    }

    // Check tenant status
    if (tenant.status === 'suspended') {
      generateResponse(
        res,
        403,
        { status: tenant.status },
        false,
        'Your account has been suspended. Please contact support.'
      );
      return;
    }

    if (tenant.status === 'expired') {
      generateResponse(
        res,
        403,
        { status: tenant.status },
        false,
        'Your subscription has expired. Please renew to continue.'
      );
      return;
    }

    if (tenant.status === 'cancelled') {
      generateResponse(
        res,
        403,
        { status: tenant.status },
        false,
        'Your account has been cancelled.'
      );
      return;
    }

    // Get or create tenant Prisma client
    const tenantPrisma = getTenantPrisma(tenant.id, tenant.db_url);

    // Inject tenant context into request
    req.context = {
      type: 'TENANT',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        plan: tenant.plan,
      },
      prisma: tenantPrisma as any, // Type assertion for compatibility
    };

    logger.info(`✅ Tenant resolved: ${tenant.name} (${tenant.id})`);

    next();
  } catch (error) {
    logger.error('Tenant resolution error:', error);
    generateResponse(
      res,
      500,
      {},
      false,
      'Failed to resolve tenant. Please try again.'
    );
  }
};

/**
 * Platform Resolver Middleware
 * 
 * Injects platform context into request for platform admin routes
 */
export const platformResolver = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const platformPrisma = getPrisma();

    // Inject platform context into request
    req.context = {
      type: 'PLATFORM',
      prisma: platformPrisma as any, // Type assertion for compatibility
    };

    logger.info('✅ Platform context resolved');

    next();
  } catch (error) {
    logger.error('Platform resolution error:', error);
    generateResponse(
      res,
      500,
      {},
      false,
      'Failed to resolve platform context. Please try again.'
    );
  }
};
