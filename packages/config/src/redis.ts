import Redis from 'ioredis';

let sharedConnection: Redis | null = null;

const defaultUrl = 'redis://127.0.0.1:6379';

export function getRedisConnection(): Redis {
  if (sharedConnection) return sharedConnection;
  const url = process.env.REDIS_URL ?? defaultUrl;
  sharedConnection = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
  return sharedConnection;
}
