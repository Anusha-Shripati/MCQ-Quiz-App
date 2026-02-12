/**
 * Tenant utility functions for multi-tenant subdomain detection
 */

export type TenantType = 'PLATFORM' | 'TENANT';

export interface TenantContext {
  type: TenantType;
  slug: string | null;
  isPlatform: boolean;
  isValid: boolean;
}

/**
 * Validate if hostname matches expected domain pattern
 * Examples:
 *   - admin.lr-mcq.local -> valid
 *   - acme.lr-mcq.local -> valid
 *   - admin.fake.lr-mcq.local -> INVALID
 *   - localhost -> valid (dev)
 */
function isValidDomain(hostname: string): boolean {
  // Remove port if present
  const hostWithoutPort = hostname.split(':')[0];
  
  // Allow localhost for development
  if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
    return true;
  }
  
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'lr-mcq.com';
  const parts = hostWithoutPort.split('.');
  
  // Must be exactly: subdomain.basedomain (e.g., admin.lr-mcq.local)
  // Reconstruct expected format
  if (parts.length < 2) return false;
  
  // Get subdomain (first part) and remaining domain
  // const subdomain = parts[0];
  const domain = parts.slice(1).join('.');
  
  // Domain must exactly match base domain
  return domain === baseDomain;
}

/**
 * Extract subdomain from hostname with strict validation
 * Examples:
 *   - admin.lr-mcq.local -> admin
 *   - acme.lr-mcq.local -> acme
 *   - admin.fake.lr-mcq.local -> null (invalid)
 *   - localhost:3000 -> localhost
 */
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const hostWithoutPort = hostname.split(':')[0];
  
  // Handle localhost for development
  if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
    return process.env.NEXT_PUBLIC_DEV_TENANT_SLUG || 'localhost';
  }
  
  // Validate domain first
  if (!isValidDomain(hostname)) {
    return null;
  }
  
  // Extract subdomain (first part)
  const parts = hostWithoutPort.split('.');
  return parts[0];
}

/**
 * Determine tenant context from hostname with strict validation
 */
export function getTenantContext(hostname: string): TenantContext {
  const subdomain = extractSubdomain(hostname);
  
  // Invalid domain
  if (subdomain === null) {
    return {
      type: 'TENANT',
      slug: null,
      isPlatform: false,
      isValid: false,
    };
  }
  
  const isPlatform = subdomain === 'admin';

  return {
    type: isPlatform ? 'PLATFORM' : 'TENANT',
    slug: isPlatform ? null : subdomain,
    isPlatform,
    isValid: true,
  };
}

/**
 * Check if current request is for platform admin
 */
export function isPlatformAdmin(hostname: string): boolean {
  const context = getTenantContext(hostname);
  return context.isValid && context.isPlatform;
}
