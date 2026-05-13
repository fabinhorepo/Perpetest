import redis from 'redis';
import { logger } from './logger';

let client: ReturnType<typeof redis.createClient> | null = null;

export const getRedisClient = async () => {
  if (client) return client;

  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    client.on('error', (err) => logger.error(err, 'Redis Client Error'));
    client.on('connect', () => logger.info('Redis Client Connected'));

    await client.connect();
    return client;
  } catch (error) {
    logger.error(error, 'Failed to connect to Redis');
    throw error;
  }
};

export const closeRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
  }
};
