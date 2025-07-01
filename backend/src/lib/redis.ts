import Redis from 'ioredis'
import { logger } from '../config/logger'

const redis = new Redis({
  host:'localhost',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  maxRetriesPerRequest: null
});

redis.on("connect", () => {
  logger.info("Redis connected successfully!");
});

redis.on("error", (err) => {
  logger.error("Redis connection error:", err.message);
});

export default redis

