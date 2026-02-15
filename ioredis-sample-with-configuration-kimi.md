I'll create a complete, production-ready Node.js example using `ioredis` with async/await, including all the essential production configurations.

## Complete Production-Ready ioredis Example

### 1. Project Structure
```
redis-project/
├── config/
│   └── redis.js          # Redis configuration
├── services/
│   └── redisService.js   # Redis operations service
├── utils/
│   └── redisHelpers.js   # Helper utilities
├── app.js                # Main application
└── package.json
```

### 2. Installation
```bash
npm init -y
npm install ioredis dotenv
```

### 3. Configuration (`config/redis.js`)

```javascript
const Redis = require('ioredis');
require('dotenv').config();

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
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis reconnecting... attempt ${times}, delay: ${delay}ms`);
    return delay;
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
};

// Create Redis instance
const redis = new Redis(redisConfig);

// Event handlers for monitoring
redis.on('connect', () => {
  console.log('Redis: Connected');
});

redis.on('ready', () => {
  console.log('Redis: Ready');
});

redis.on('error', (err) => {
  console.error('Redis Error:', err.message);
});

redis.on('close', () => {
  console.log('Redis: Connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis: Reconnecting...');
});

redis.on('end', () => {
  console.log('Redis: End');
});

module.exports = redis;
```

### 4. Service Layer (`services/redisService.js`)

```javascript
const redis = require('../config/redis');

class RedisService {
  constructor() {
    this.redis = redis;
  }

  // ==================== STRING OPERATIONS ====================
  
  async set(key, value, ttlSeconds = null) {
    try {
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  }

  async delete(key) {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  async exists(key) {
    try {
      return await this.redis.exists(key);
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  }

  async expire(key, seconds) {
    try {
      return await this.redis.expire(key, seconds);
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  // ==================== HASH OPERATIONS ====================
  
  async hset(key, field, value) {
    try {
      const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
      return await this.redis.hset(key, field, serialized);
    } catch (error) {
      console.error(`Redis HSET error:`, error);
      throw error;
    }
  }

  async hget(key, field) {
    try {
      const data = await this.redis.hget(key, field);
      if (!data) return null;
      
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error(`Redis HGET error:`, error);
      throw error;
    }
  }

  async hgetall(key) {
    try {
      const data = await this.redis.hgetall(key);
      // Parse JSON values
      const result = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      return result;
    } catch (error) {
      console.error(`Redis HGETALL error:`, error);
      throw error;
    }
  }

  async hdel(key, ...fields) {
    try {
      return await this.redis.hdel(key, ...fields);
    } catch (error) {
      console.error(`Redis HDEL error:`, error);
      throw error;
    }
  }

  // ==================== LIST OPERATIONS ====================
  
  async lpush(key, ...values) {
    try {
      const serialized = values.map(v => JSON.stringify(v));
      return await this.redis.lpush(key, ...serialized);
    } catch (error) {
      console.error(`Redis LPUSH error:`, error);
      throw error;
    }
  }

  async rpush(key, ...values) {
    try {
      const serialized = values.map(v => JSON.stringify(v));
      return await this.redis.rpush(key, ...serialized);
    } catch (error) {
      console.error(`Redis RPUSH error:`, error);
      throw error;
    }
  }

  async lpop(key) {
    try {
      const data = await this.redis.lpop(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis LPOP error:`, error);
      throw error;
    }
  }

  async rpop(key) {
    try {
      const data = await this.redis.rpop(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis RPOP error:`, error);
      throw error;
    }
  }

  async lrange(key, start = 0, stop = -1) {
    try {
      const data = await this.redis.lrange(key, start, stop);
      return data.map(item => {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      });
    } catch (error) {
      console.error(`Redis LRANGE error:`, error);
      throw error;
    }
  }

  // ==================== SET OPERATIONS ====================
  
  async sadd(key, ...members) {
    try {
      const serialized = members.map(m => JSON.stringify(m));
      return await this.redis.sadd(key, ...serialized);
    } catch (error) {
      console.error(`Redis SADD error:`, error);
      throw error;
    }
  }

  async smembers(key) {
    try {
      const data = await this.redis.smembers(key);
      return data.map(item => {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      });
    } catch (error) {
      console.error(`Redis SMEMBERS error:`, error);
      throw error;
    }
  }

  async srem(key, ...members) {
    try {
      const serialized = members.map(m => JSON.stringify(m));
      return await this.redis.srem(key, ...serialized);
    } catch (error) {
      console.error(`Redis SREM error:`, error);
      throw error;
    }
  }

  async sismember(key, member) {
    try {
      return await this.redis.sismember(key, JSON.stringify(member));
    } catch (error) {
      console.error(`Redis SISMEMBER error:`, error);
      throw error;
    }
  }

  // ==================== SORTED SET OPERATIONS ====================
  
  async zadd(key, score, member) {
    try {
      const serialized = JSON.stringify(member);
      return await this.redis.zadd(key, score, serialized);
    } catch (error) {
      console.error(`Redis ZADD error:`, error);
      throw error;
    }
  }

  async zrange(key, start = 0, stop = -1, withScores = false) {
    try {
      const args = withScores ? [start, stop, 'WITHSCORES'] : [start, stop];
      const data = await this.redis.zrange(key, ...args);
      
      if (!withScores) {
        return data.map(item => {
          try {
            return JSON.parse(item);
          } catch {
            return item;
          }
        });
      }
      
      // Parse with scores
      const result = [];
      for (let i = 0; i < data.length; i += 2) {
        result.push({
          member: JSON.parse(data[i]),
          score: parseFloat(data[i + 1])
        });
      }
      return result;
    } catch (error) {
      console.error(`Redis ZRANGE error:`, error);
      throw error;
    }
  }

  async zrem(key, ...members) {
    try {
      const serialized = members.map(m => JSON.stringify(m));
      return await this.redis.zrem(key, ...serialized);
    } catch (error) {
      console.error(`Redis ZREM error:`, error);
      throw error;
    }
  }

  // ==================== PIPELINE OPERATIONS ====================
  
  /**
   * Execute multiple commands in a pipeline for better performance
   * @param {Function} pipelineFn - Function that receives pipeline instance
   * @returns {Array} - Results of all commands
   */
  async pipeline(pipelineFn) {
    try {
      const pipeline = this.redis.pipeline();
      pipelineFn(pipeline);
      const results = await pipeline.exec();
      
      // Parse results and handle errors
      return results.map(([err, result]) => {
        if (err) throw err;
        
        // Try to parse JSON for string results
        if (typeof result === 'string') {
          try {
            return JSON.parse(result);
          } catch {
            return result;
          }
        }
        return result;
      });
    } catch (error) {
      console.error('Redis Pipeline error:', error);
      throw error;
    }
  }

  /**
   * Atomic transaction with MULTI/EXEC
   * @param {Function} transactionFn - Function that receives multi instance
   * @returns {Array} - Results of all commands
   */
  async transaction(transactionFn) {
    try {
      const multi = this.redis.multi();
      transactionFn(multi);
      const results = await multi.exec();
      
      return results.map(([err, result]) => {
        if (err) throw err;
        return result;
      });
    } catch (error) {
      console.error('Redis Transaction error:', error);
      throw error;
    }
  }

  // ==================== PUB/SUB OPERATIONS ====================
  
  async publish(channel, message) {
    try {
      const serialized = JSON.stringify(message);
      return await this.redis.publish(channel, serialized);
    } catch (error) {
      console.error(`Redis PUBLISH error:`, error);
      throw error;
    }
  }

  subscribe(channel, callback) {
    // Create separate connection for pub/sub
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    subscriber.subscribe(channel);
    
    subscriber.on('message', (receivedChannel, message) => {
      try {
        const parsed = JSON.parse(message);
        callback(receivedChannel, parsed);
      } catch {
        callback(receivedChannel, message);
      }
    });

    return {
      unsubscribe: () => subscriber.unsubscribe(channel),
      quit: () => subscriber.quit()
    };
  }

  // ==================== UTILITY OPERATIONS ====================
  
  async keys(pattern) {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error:`, error);
      throw error;
    }
  }

  async flushdb() {
    try {
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
        throw new Error('FLUSHDB not allowed in production');
      }
      return await this.redis.flushdb();
    } catch (error) {
      console.error(`Redis FLUSHDB error:`, error);
      throw error;
    }
  }

  async ping() {
    try {
      return await this.redis.ping();
    } catch (error) {
      console.error(`Redis PING error:`, error);
      throw error;
    }
  }

  async info() {
    try {
      return await this.redis.info();
    } catch (error) {
      console.error(`Redis INFO error:`, error);
      throw error;
    }
  }

  // Graceful shutdown
  async quit() {
    await this.redis.quit();
  }

  async disconnect() {
    this.redis.disconnect();
  }
}

// Export singleton instance
module.exports = new RedisService();
```

### 5. Main Application (`app.js`)

```javascript
const redisService = require('./services/redisService');

async function runExamples() {
  try {
    console.log('=== Redis Operations Demo ===\n');

    // 1. String Operations
    console.log('1. String Operations:');
    await redisService.set('user:1', { name: 'John', age: 30 }, 60); // with 60s TTL
    const user = await redisService.get('user:1');
    console.log('   Get user:', user);
    
    await redisService.expire('user:1', 120); // Extend TTL
    const exists = await redisService.exists('user:1');
    console.log('   Exists:', exists);
    await redisService.delete('user:1');
    console.log('   Deleted user:1\n');

    // 2. Hash Operations
    console.log('2. Hash Operations:');
    await redisService.hset('profile:1', 'name', 'Alice');
    await redisService.hset('profile:1', 'settings', { theme: 'dark', notifications: true });
    const profile = await redisService.hgetall('profile:1');
    console.log('   Profile:', profile);
    await redisService.hdel('profile:1', 'settings');
    console.log('   After delete:', await redisService.hgetall('profile:1'));
    console.log('');

    // 3. List Operations
    console.log('3. List Operations:');
    await redisService.rpush('queue:tasks', { id: 1, task: 'email' }, { id: 2, task: 'sms' });
    await redisService.lpush('queue:tasks', { id: 0, task: 'priority' });
    const tasks = await redisService.lrange('queue:tasks');
    console.log('   All tasks:', tasks);
    const firstTask = await redisService.lpop('queue:tasks');
    console.log('   Popped:', firstTask);
    console.log('   Remaining:', await redisService.lrange('queue:tasks'));
    console.log('');

    // 4. Set Operations
    console.log('4. Set Operations:');
    await redisService.sadd('tags:post:1', 'javascript', 'nodejs', 'redis');
    await redisService.sadd('tags:post:1', 'javascript'); // Duplicate ignored
    const tags = await redisService.smembers('tags:post:1');
    console.log('   Tags:', tags);
    const hasTag = await redisService.sismember('tags:post:1', 'nodejs');
    console.log('   Has nodejs:', hasTag);
    await redisService.srem('tags:post:1', 'nodejs');
    console.log('   After remove:', await redisService.smembers('tags:post:1'));
    console.log('');

    // 5. Sorted Set Operations
    console.log('5. Sorted Set Operations:');
    await redisService.zadd('leaderboard', 100, { user: 'Alice' });
    await redisService.zadd('leaderboard', 150, { user: 'Bob' });
    await redisService.zadd('leaderboard', 75, { user: 'Charlie' });
    const topPlayers = await redisService.zrange('leaderboard', 0, -1, true);
    console.log('   Leaderboard (with scores):', topPlayers);
    console.log('');

    // 6. Pipeline Example (Batch operations)
    console.log('6. Pipeline Operations:');
    const pipelineResults = await redisService.pipeline((pipe) => {
      pipe.set('pipe:1', JSON.stringify({ data: 1 }));
      pipe.set('pipe:2', JSON.stringify({ data: 2 }));
      pipe.get('pipe:1');
      pipe.get('pipe:2');
      pipe.del('pipe:1', 'pipe:2');
    });
    console.log('   Pipeline results:', pipelineResults);
    console.log('');

    // 7. Transaction Example (Atomic operations)
    console.log('7. Transaction Operations:');
    await redisService.set('balance:alice', 1000);
    await redisService.set('balance:bob', 500);
    
    try {
      const txResults = await redisService.transaction((multi) => {
        multi.decrby('balance:alice', 100);
        multi.incrby('balance:bob', 100);
      });
      console.log('   Transaction results:', txResults);
      console.log('   Alice:', await redisService.get('balance:alice'));
      console.log('   Bob:', await redisService.get('balance:bob'));
    } catch (err) {
      console.error('   Transaction failed:', err);
    }
    console.log('');

    // 8. Health Check
    console.log('8. Health Check:');
    const ping = await redisService.ping();
    console.log('   Ping:', ping);
    const info = await redisService.info('server');
    console.log('   Server info:', info.split('\r\n').slice(0, 5).join('\n   '));

    // Cleanup
    await redisService.delete('profile:1', 'queue:tasks', 'tags:post:1', 
                               'leaderboard', 'balance:alice', 'balance:bob');

    console.log('\n=== All operations completed successfully ===');

  } catch (error) {
    console.error('Error in examples:', error);
  } finally {
    // Graceful shutdown
    await redisService.quit();
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, closing Redis connection...');
  await redisService.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, closing Redis connection...');
  await redisService.quit();
  process.exit(0);
});

// Run examples
runExamples();
```

### 6. Environment File (`.env`)

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password_here
REDIS_DB=0
REDIS_PREFIX=myapp:
REDIS_TLS=false

# Node Environment
NODE_ENV=development
```

### 7. `package.json`

```json
{
  "name": "redis-production-example",
  "version": "1.0.0",
  "description": "Production-ready Redis example with ioredis",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "dotenv": "^16.3.1",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## Key Production Features Included:

| Feature | Purpose |
|---------|---------|
| **Connection Pooling** | `maxRetriesPerRequest`, `enableReadyCheck` |
| **Retry Strategy** | Exponential backoff for reconnection |
| **Timeouts** | `connectTimeout`, `maxLoadingTimeout` |
| **Password Auth** | `password` field for secure connections |
| **TLS Support** | Encrypted connections for cloud Redis |
| **Key Prefixing** | Namespace isolation |
| **Pipelining** | Batch operations for performance |
| **Transactions** | Atomic MULTI/EXEC operations |
| **Pub/Sub** | Real-time messaging with separate connection |
| **Graceful Shutdown** | Proper cleanup on SIGINT/SIGTERM |
| **Error Handling** | Comprehensive try-catch with logging |
| **JSON Serialization** | Automatic object serialization |

## Running the Example

1. **Start Redis locally** or use a cloud service (Redis Cloud, AWS ElastiCache, etc.)
2. **Install dependencies**: `npm install`
3. **Configure `.env`** with your Redis credentials
4. **Run**: `npm start`

This example covers all major Redis data types with production-ready error handling, connection management, and performance optimizations like pipelining!