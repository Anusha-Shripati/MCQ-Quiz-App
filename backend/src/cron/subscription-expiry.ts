import cron from 'node-cron';
import { getPrisma } from '../db/prisma/client';
import { logger } from '../config/logger';

/**
 * Subscription Expiry Cron Job
 * 
 * Runs daily at 1 AM to check and update expired subscriptions/trials
 * 
 * Scenarios covered:
 * 1. Trial expiry - Updates status from 'trial' to 'expired'
 * 2. Subscription expiry - Updates status from 'active' to 'expired'
 * 3. Handles null dates gracefully
 * 4. Skips already expired/cancelled/suspended tenants
 * 5. Per-tenant error handling (one failure doesn't stop others)
 */
cron.schedule('0 1 * * *', async () => {
    logger.info('🕐 Running subscription expiry cron job at 1 AM');
    
    try {
        const platformPrisma = getPrisma();
        const now = new Date();
        
        let totalProcessed = 0;
        let totalExpired = 0;
        let totalErrors = 0;
        
        // Get all non-deleted tenants that could potentially expire
        const tenants = await platformPrisma.tenants.findMany({
            where: {
                deleted_at: null,
                status: {
                    in: ['active', 'trial']
                },
                OR: [
                    { trial_ends_at: { not: null } },
                    { subscription_ends_at: { not: null } }
                ]
            },
            include: {
                plan: true
            }
        });
        
        logger.info(`📋 Found ${tenants.length} tenants to check for expiry`);
        
        // Process each tenant
        for (const tenant of tenants) {
            totalProcessed++;
            
            try {
                let shouldExpire = false;
                let expiryReason = '';
                
                // Scenario 1: Check trial expiry
                if (tenant.status === 'trial' && tenant.trial_ends_at) {
                    if (tenant.trial_ends_at <= now) {
                        shouldExpire = true;
                        expiryReason = `Trial expired on ${tenant.trial_ends_at.toISOString()}`;
                    }
                }
                
                // Scenario 2: Check subscription expiry
                if (tenant.status === 'active' && tenant.subscription_ends_at) {
                    if (tenant.subscription_ends_at <= now) {
                        shouldExpire = true;
                        expiryReason = `Subscription expired on ${tenant.subscription_ends_at.toISOString()}`;
                    }
                }
                
                // Update tenant status if expired
                if (shouldExpire) {
                    await platformPrisma.tenants.update({
                        where: { id: tenant.id },
                        data: {
                            status: 'expired',
                            updated_at: now
                        }
                    });
                    
                    totalExpired++;
                    logger.warn(`⚠️  Tenant expired: ${tenant.name} (${tenant.slug}) - ${expiryReason}`);
                } else {
                    logger.info(`✅ Tenant active: ${tenant.name} (${tenant.slug})`);
                }
                
            } catch (error) {
                totalErrors++;
                logger.error(`❌ Error processing tenant ${tenant.name} (${tenant.slug}):`, error);
                // Continue processing other tenants
            }
        }
        
        // Summary log
        logger.info(`
📊 Subscription expiry cron job completed:
   - Total processed: ${totalProcessed}
   - Total expired: ${totalExpired}
   - Total errors: ${totalErrors}
        `);
        
    } catch (error) {
        logger.error('❌ Critical error in subscription expiry cron job:', error);
    }
});

logger.info('✅ Subscription expiry cron job registered (runs daily at 1 AM)');
