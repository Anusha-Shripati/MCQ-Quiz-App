import { Request, Response, NextFunction } from 'express';
import { PrismaClient as PlatformPrismaClient } from '../db/prisma/generated/client';
import { PrismaClient as TenantPrismaClient } from '../db/tenant/generated/client';
import { getPrisma } from '../db/prisma/client';
import { getTenantPrisma } from '../db/tenant/client';
import { generateResponse } from '../utils/generateResponse';
import { logger } from '../config/logger';

/**
 * Validate if hostname matches expected domain pattern
 */
const isValidDomain = (hostname: string): boolean => {
  // Allow localhost for development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  
  const baseDomain = process.env.BASE_DOMAIN || 'lr-mcq.local';
  const parts = hostname.split('.');
  
  // Must be exactly: subdomain.basedomain (e.g., admin.lr-mcq.local)
  if (parts.length < 2) return false;
  
  // Get remaining domain after subdomain
  const domain = parts.slice(1).join('.');
  
  // Domain must exactly match base domain
  return domain === baseDomain;
};

/**
 * Extract subdomain from Origin or Referer header
 * These headers contain the frontend URL with subdomain
 */
const extractSubdomainFromOrigin = (req: Request): string | null => {
  // Try Origin header first (sent on CORS requests)
  const origin = req.headers.origin;
  if (origin) {
    try {
      const url = new URL(origin);
      return extractSubdomain(url.hostname);
    } catch (error) {
      logger.warn(`Failed to parse Origin header: ${origin}`);
    }
  }

  // Fallback to Referer header
  const referer = req.headers.referer;
  if (referer) {
    try {
      const url = new URL(referer);
      return extractSubdomain(url.hostname);
    } catch (error) {
      logger.warn(`Failed to parse Referer header: ${referer}`);
    }
  }

  return null;
};

/**
 * Extract subdomain from hostname with strict validation
 * Examples:
 *   - abc.lr-mcq.local -> abc
 *   - admin.lr-mcq.local -> admin
 *   - admin.fake.lr-mcq.local -> null (invalid)
 *   - localhost:3001 -> localhost (for development)
 */
const extractSubdomain = (hostname: string): string | null => {
  // Handle localhost for development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return process.env.DEV_TENANT_SLUG || 'localhost';
  }

  // Validate domain first
  if (!isValidDomain(hostname)) {
    logger.warn(`Invalid domain: ${hostname}`);
    return null;
  }

  // Extract subdomain from hostname
  const parts = hostname.split('.');
  return parts[0];
};

/**
 * Tenant Resolver Middleware
 * 
 * Resolves tenant from x-tenant-slug header (sent by frontend)
 * Falls back to Origin/Referer headers if x-tenant-slug not present
 * This middleware should be applied to all tenant routes (not platform routes)
 */
export const tenantResolver = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Tenant resolver invoked for URL:', req.originalUrl);
    
    // Priority 1: Read from x-tenant-slug header (sent by frontend)
    let subdomain = req.headers['x-tenant-slug'] as string;
    
    // Priority 2: Fallback to Origin/Referer headers (contain frontend URL)
    if (!subdomain) {
      subdomain = extractSubdomainFromOrigin(req) || '';
      logger.info(`Tenant slug from Origin/Referer: ${subdomain}`);
    }
    
    // If still no subdomain found, return error
    if (!subdomain) {
      generateResponse(
        res,
        400,
        { headers: { origin: req.headers.origin, referer: req.headers.referer } },
        false,
        'Tenant slug not found. Please provide x-tenant-slug header or valid Origin/Referer.',
        'TENANT_SLUG_MISSING'
      );
      return;
    }

    logger.info(`Tenant resolution: x-tenant-slug=${req.headers['x-tenant-slug']}, origin=${req.headers.origin}, resolved=${subdomain}`);

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
        'Organization not found. Please check your URL.',
        'TENANT_NOT_FOUND'
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
        'Your account has been suspended. Please contact support.',
        'TENANT_SUSPENDED'
      );
      return;
    }

    if (tenant.status === 'expired') {
      generateResponse(
        res,
        403,
        { status: tenant.status },
        false,
        'Your subscription has expired. Please renew to continue.',
        'TENANT_EXPIRED'
      );
      return;
    }

    if (tenant.status === 'cancelled') {
      generateResponse(
        res,
        403,
        { status: tenant.status },
        false,
        'Your account has been cancelled.',
        'TENANT_CANCELLED'
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
