const { createClient } = require('redis');
const config = require('./index');

const redis = createClient({
  url: config.redis.url,
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

async function checkRedisConnection() {
  if (!redis.isOpen) {
    await connectRedis();
  }

  return redis.isReady;
}

async function closeRedis() {
  if (redis.isOpen) {
    await redis.quit();
  }
}

module.exports = {
  redis,
  connectRedis,
  checkRedisConnection,
  closeRedis
};
