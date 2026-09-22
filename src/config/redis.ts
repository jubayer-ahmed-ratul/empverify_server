import Redis from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

if (env.REDIS_URL) {
  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });
  } catch (error) {
    console.warn('⚠️  Redis initialization failed. Continuing without cache.');
    redis = null;
  }
}

export { redis };

export const getCache = async (key: string): Promise<string | null> => {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> => {
  if (!redis) return;
  try {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache pattern delete error:', error);
  }
};
