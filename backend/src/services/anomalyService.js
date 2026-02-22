const Redis = require('ioredis');
const config = require('../config');

// Redis state
let redis = null;
let redisAvailable = false;
let redisInitialized = false;
let warningShown = false;

function showWarningOnce() {
  if (!warningShown) {
    warningShown = true;
    console.warn('⚠️  Redis not available. Anomaly detection disabled.');
    console.warn('   The system will work normally, but anomaly detection will not function.');
    console.warn('   To enable: Start Redis or use Redis Cloud (see WINDOWS_SETUP.md)\n');
  }
}

function initializeRedis() {
  if (redisInitialized) return;
  redisInitialized = true;

  try {
    redis = new Redis(config.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: () => null, // Don't retry
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      showFriendlyErrorStack: false,
      connectTimeout: 2000,
      commandTimeout: 2000,
      // Suppress connection errors
      enableReadyCheck: false
    });

    // Handle all error events to prevent spam
    const errorHandler = () => {
      if (redisAvailable) {
        redisAvailable = false;
      }
      showWarningOnce();
    };

    redis.on('error', errorHandler);
    redis.on('close', () => {
      redisAvailable = false;
    });

    redis.on('connect', () => {
      redisAvailable = true;
      console.log('✅ Redis connected');
    });

    redis.on('ready', () => {
      redisAvailable = true;
    });

    // Suppress unhandled promise rejections and AggregateErrors from Redis
    const redisErrorHandler = (reason) => {
      if (reason) {
        const isRedisError = 
          reason.code === 'ECONNREFUSED' ||
          (reason.message && reason.message.includes('ECONNREFUSED')) ||
          (reason.message && reason.message.includes('Redis')) ||
          (reason.errors && reason.errors.some(e => e.code === 'ECONNREFUSED'));
        
        if (isRedisError) {
          redisAvailable = false;
          showWarningOnce();
          return true; // Error handled
        }
      }
      return false;
    };

    process.on('unhandledRejection', (reason, promise) => {
      if (redisErrorHandler(reason)) {
        // Error handled, don't propagate
        return;
      }
    });

    // Try to connect, but don't block on failure
    redis.connect().then(() => {
      redisAvailable = true;
    }).catch(() => {
      redisAvailable = false;
      showWarningOnce();
    });
  } catch (err) {
    redisAvailable = false;
    showWarningOnce();
  }
}

// Initialize Redis (non-blocking)
setTimeout(() => {
  initializeRedis();
}, 100);

const SEARCH_LIMIT   = 10;
const WINDOW_SECONDS = 60;

/** MongoDB fallback when Redis is unavailable (e.g. demo without Redis) */
async function checkWithMongo(user_id) {
  try {
    const { checkAndIncrementSearchCount } = require('../models/searchRateLimit');
    return await checkAndIncrementSearchCount(user_id);
  } catch (err) {
    console.error('MongoDB rate limit fallback error:', err);
    return false;
  }
}

async function checkWithRedis(user_id) {
  const key   = `search_count:${user_id}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW_SECONDS);
  return count > SEARCH_LIMIT;
}

/**
 * Check and record search count. Returns true if rate limit exceeded (anomaly).
 * Uses Redis when available, MongoDB fallback otherwise.
 */
async function checkAndRecordSearch(user_id) {
  if (redisAvailable && redis) {
    try {
      return await checkWithRedis(user_id);
    } catch (error) {
      // Fall through to MongoDB
    }
  }
  return await checkWithMongo(user_id);
}

module.exports = { checkAndRecordSearch };
