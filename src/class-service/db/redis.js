import Redis from "ioredis";
import { logger } from "#shared/utils/index.js";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  keyPrefix: process.env.REDIS_PREFIX || "",
  
  tls: {}, // TLS handshake Bắt buộc cho Elasticache Valkey
  lazyConnect: true,
  enableReadyCheck: true,

  connectTimeout: 3000,
  commandTimeout: 2000,

  retryStrategy(times) {
    return Math.min(times * 200, 1000);
  },
});

// Event listeners để debug
redis.on("connect", () => logger.info("Connected to Redis"));
redis.on("ready", () => logger.info("Redis TLS ready"));
redis.on("error", (err) => logger.error("Redis error: ", err));

export default redis;