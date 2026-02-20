import { createClient, RedisClientType } from 'redis';

// Singleton Redis client instance
let redisClient: RedisClientType | null = null;

/**
 * Get or create Redis client connection
 * Uses singleton pattern to reuse connection across requests
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✓ Redis Client Connected');
    });

    redisClient.on('reconnecting', () => {
      console.log('⟳ Redis Client Reconnecting...');
    });

    await redisClient.connect();
  }

  return redisClient;
}

/**
 * Close Redis connection (useful for cleanup)
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Get cached data by key
 * Returns null if key doesn't exist or on error (graceful fallback)
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const data = await client.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null; // Fallback to DB on cache error
  }
}

/**
 * Set cached data with TTL (time to live in seconds)
 * Default TTL is 60 seconds
 */
export async function setCache(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Redis SET error:', error);
    // Don't throw - cache failures shouldn't break the app
  }
}

/**
 * Delete cached data by key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Redis DELETE error:', error);
  }
}
