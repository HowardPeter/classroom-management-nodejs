import redis from '../../db/redis.js';
import crypto from "crypto";
import { logger } from "#shared/utils/index.js";

const DEFAULT_TTL = 3600;
const REFRESH_THRESHOLD = 300;

export default class RedisCache {
  // Hàm hash cho key truyền vào JSON, tránh json escapse
  static generateKey(prefix, obj = {}) {
    const hash = crypto.createHash("md5")
      .update(JSON.stringify(obj))
      .digest("hex");
    return `${prefix}:${hash}`;
  }

  static async refreshAhead(key, fetchFn, ttl = DEFAULT_TTL) {
    try {
      const data = await fetchFn();
      if (data) {
        await redis.set(key, JSON.stringify(data), "EX", ttl);
      }
    } catch (error) {
      logger.error("Redis refefresh ahead error: ", error);
    }
  }

  static async cacheRead(key, fetchFn, ttl = DEFAULT_TTL) {
    const cached = await redis.get(key)

    if (cached) {
      // Nếu TTL sắp hết thì refresh ahead
      const timeLeft = await redis.ttl(key);
      if (timeLeft > 0 & timeLeft <= REFRESH_THRESHOLD) {
        this.refreshAhead(key, fetchFn, ttl);
      }

      logger.info(`[CACHE HIT] key = ${key}`);
      return JSON.parse(cached);
    }

    // Cache miss -> lấy từ DB
    const data = await fetchFn();
    await redis.set(key, JSON.stringify(data), "EX", ttl);
    logger.info(`[CACHE SET] key = ${key}, ttl = ${ttl}s`);

    return data;
  }

  // xóa cache theo pattern cho findMany khi write (batch 100)
  static async deleteByPattern(pattern) {
    try {
      let cursor = "0";
      const prefix = redis.options.keyPrefix || "";
      const fullPattern = `${prefix}${pattern}`;

      do {
        // lấy các keys match với pattern bằng redis.scan
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", fullPattern, "COUNT", 100);
        cursor = nextCursor;

        if (keys.length > 0) {
          logger.info(`[CACHE DEL PATTERN] pattern = ${pattern}, matched = ${keys}`);

          // xóa prefix vì ioredis tự động thêm keyPrefix cho del()
          const cleanKeys = keys.map(k => k.replace(prefix, ""));

          if (cleanKeys.length > 0) {
            await redis.del(...cleanKeys);
            logger.info(`[CACHE DEL DONE] keys deleted = ${cleanKeys}`);
          }
        }
      } while (cursor !== "0");
    } catch (error) {
      logger.error(`Redis deleteByPattern error: ${error.message}`, { stack: error.stack });
    }
  }

  static async cacheWrite(key = "", writeFn, payload, invalidatePattern = []) {
    const data = await writeFn(payload);

    if (key) {
      logger.info(`[CACHE DEL DIRECT] key = ${key}`);
      await redis.del(key);
    }

    // Xóa tất cả keys match pattern, reset key cho findMany
    for (const pattern of invalidatePattern) {
      if (pattern.includes("*")) {
        await this.deleteByPattern(pattern);
      } else {
        logger.info(`[CACHE DEL DIRECT] key = ${pattern}`);
        await redis.del(pattern);
      }
    }

    return data;
  }
}