require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',

  server: {
    port: Number(process.env.PORT || 3000),
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },

  database: {
    url: process.env.DATABASE_URL || '',
    poolMax: Number(process.env.DB_POOL_MAX || 20),
    idleTimeout: Number(process.env.DB_IDLE_TIMEOUT || 30000),
    connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT || 10000)
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  ton: {
    network: process.env.TON_NETWORK || 'testnet',
    endpoint: process.env.TON_ENDPOINT || '',
    apiKey: process.env.TON_API_KEY || '',
    jettonMasterAddress:
      process.env.AVC_JETTON_MASTER_ADDRESS || '',
    treasuryAddress:
      process.env.AVC_TREASURY_ADDRESS || ''
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || ''
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};

module.exports = config;
