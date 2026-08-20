const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy(retries) {
      return Math.min(retries * 100, 3000);
    }
  }
});

redis.on('error', (error) => {
  console.error('Redis error:', error);
});

redis.on('connect', () => {
  console.log('Redis connecting...');
});

redis.on('ready', () => {
  console.log('Redis ready');
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }

  return redis;
}

async function closeRedis() {
  if (redis.isOpen) {
    await redis.quit();
  }
}

module.exports = {
  redis,
  connectRedis,
  closeRedis
};
