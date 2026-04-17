const Redis = require('ioredis')
require('dotenv').config()

// Production-ready Redis configuration
const redisConfig = {
  // Connection settings
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  
  // Connection pool & timeouts
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  maxLoadingTimeout: 30000,
  
  // Reconnection strategy
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    console.log(`Redis reconnecting... attempt ${times}, delay: ${delay}ms`)
    return delay
  },
  
  // Connection timeout
  connectTimeout: 10000,
  
  // Keep alive
  keepAlive: 30000,
  
  // TLS for production (optional)
  tls: process.env.REDIS_TLS === 'true' ? {
    rejectUnauthorized: false
  } : undefined,
  
  // Key prefix for namespace isolation
  keyPrefix: process.env.REDIS_PREFIX || 'app:',
  
  // Lazy connect - connect on first command
  lazyConnect: false,
  
  // Show friendly error stack
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production'
}

// Create Redis instance
const redis = new Redis(redisConfig)

// Event handlers for monitoring
redis.on('connect', () => {
  console.log('Redis: Connected')
})

redis.on('ready', () => {
  console.log('Redis: Ready')
})

redis.on('error', (err) => {
  console.error('Redis Error:', err.message)
})

redis.on('close', () => {
  console.log('Redis: Connection closed')
})

redis.on('reconnecting', () => {
  console.log('Redis: Reconnecting...')
})

redis.on('end', () => {
  console.log('Redis: End')
})

module.exports = redis