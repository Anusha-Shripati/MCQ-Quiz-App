
import { Queue } from 'bullmq';
import redis from '../lib/redis';


export const mergeQueue = new Queue('mergeChunk', {
  connection: redis,
});
