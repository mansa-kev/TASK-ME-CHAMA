import { createClient } from 'redis';

// Use external Redis if provided, else attempt local default (for fallback/dev)
const REDIS_URL = process.env.REDIS_URL;

export const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect asynchronously but don't block the module export
redisClient.connect().catch(console.error);

export default redisClient;
