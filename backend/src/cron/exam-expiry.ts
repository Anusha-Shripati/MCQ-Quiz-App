import cron from 'node-cron'
import { prisma } from '../db/prisma.client';

cron.schedule('0 0 * * *', async () => {
    console.log('cron at 12 am');
    
    await prisma.exam.updateMany({
        where: {
            end_time: {
                lt: new Date()
            },
            is_completed:false
        },
        data: {
            status: "expired",
            is_completed:true,
        }
    });
});