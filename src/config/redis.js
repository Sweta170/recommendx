/**
 * Redis Connection & Client Configuration (Optimized for Redis Cloud & Graceful Fallback)
 * RecommendX - Distributed Product Recommendation Engine
 */

const { createClient } = require('redis');
require('dotenv').config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const redisUsername = process.env.REDIS_USERNAME || 'default';

// Determine if Redis Cloud / Remote TLS is needed
const isCloudHost = redisHost.includes('cloud.redislabs.com') || redisHost.includes('upstash.io') || process.env.REDIS_TLS === 'true';

const clientOptions = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      username: redisPassword ? redisUsername : undefined,
      password: redisPassword || undefined,
      socket: {
        host: redisHost,
        port: redisPort,
        tls: isCloudHost ? true : false,
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            // Stop retrying after 2 attempts if Redis is not running locally
            return false;
          }
          return 500;
        },
      },
    };

// Create Redis Client instance
const redisClient = createClient(clientOptions);

// Lifecycle Events
redisClient.on('connect', () => {
  console.log(`🔌 [Redis Connecting] ${redisHost}:${redisPort}`);
});

redisClient.on('ready', () => {
  console.log('✅ [Redis Ready] Connected to Redis Cache successfully.');
});

redisClient.on('error', (err) => {
  // Gracefully log single warning instead of crashing
  if (process.env.NODE_ENV === 'development' && !isCloudHost) {
    // Suppress noisy output for optional local fallback
  } else {
    console.error('⚠️ [Redis Error]:', err.message);
  }
});

/**
 * Initialize connection to Redis gracefully
 * @returns {Promise<boolean>}
 */
const connectRedis = async () => {
  // If Redis host is local and no password, check if user wants to skip or try
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (err) {
    console.warn('ℹ️ [Redis Cache Notice] Redis is optional or not reachable yet. App will query PostgreSQL directly.');
    return false;
  }
};

/**
 * Gracefully disconnect from Redis
 */
const closeRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('🔌 [Redis Disconnected Gracefully]');
    }
  } catch (err) {
    // Ignore close error
  }
};

module.exports = {
  redisClient,
  connectRedis,
  closeRedis,
};
