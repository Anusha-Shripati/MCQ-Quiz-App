import cron from 'node-cron'
import { getPrisma } from '../db/prisma/client';
import { getTenantPrisma } from '../db/tenant/client';
import { logger } from '../config/logger';

cron.schedule('0 0 * * *', async () => {
    logger.info('Running exam expiry cron job at 12 am');
    
    try {
        const platformPrisma = getPrisma();
        
        // Get all active tenants
        const tenants = await platformPrisma.tenants.findMany({
            where: {
                status: 'active',
                deleted_at: null
            }
        });
        
        // Update expired exams for each tenant
        for (const tenant of tenants) {
            try {
                const tenantPrisma = getTenantPrisma(tenant.id, tenant.db_url);
                
                await tenantPrisma.exam.updateMany({
                    where: {
                        end_time: {
                            lt: new Date()
                        },
                        is_completed: false
                    },
                    data: {
                        status: "expired",
                        is_completed: true,
                    }
                });
                
                logger.info(`Exam expiry updated for tenant: ${tenant.name}`);
            } catch (error) {
                logger.error(`Error updating exams for tenant ${tenant.name}:`, error);
            }
        }
        
        logger.info('Exam expiry cron job completed');
    } catch (error) {
        logger.error('Error in exam expiry cron job:', error);
    }
});