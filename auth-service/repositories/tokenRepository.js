import redis from '../db/redis.js';
import { hashToken } from '../utils/index.js';

const DEFAULT_TTL = 7 * 24 * 60 * 60;

class TokenRepository {
  key(userId, sessionId) {
    return `refresh:${userId}:${sessionId}`;
  }

  async findRefreshHash(userId, sessionId) {
    return await redis.get(this.key(userId, sessionId));
  }

  // Hash và lưu refresh token với ttl
  async createRefreshHash(userId, sessionId, token, ttl = DEFAULT_TTL) {
    const hashedToken = hashToken(token);
    return await redis.set(this.key(userId, sessionId), hashedToken, "EX", ttl);
  }

  // Atomic rotate: chỉ set newHash nếu current == oldHash
  async rotateRefreshHash(userId, sessionId, oldToken, newToken, ttl = DEFAULT_TTL) {
    const key = this.key(userId, sessionId);
    const oldHash = hashToken(oldToken);
    const newHash = hashToken(newToken);
    // lua script tránh race condition (request khác chen vào)
    const lua = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        redis.call("SET", KEYS[1], ARGV[2], "EX", ARGV[3])
        return 1
      else
        return 0
      end
    `;
    const res = await redis.eval(lua, 1, key, oldHash, newHash, String(ttl));
    return res === 1; // true nếu rotate thành công
  }

  // Xóa token của session
  async deleteRefreshHash(userId, sessionId) {
    return await redis.del(this.key(userId, sessionId));
  }

  // Xóa toàn bộ token
  async deleteAllHash(userId) {
    const keys = await redis.keys(`refresh:${userId}:*`);
    if (keys.length === 0) return;
    return await redis.del(keys);
  }
}

export default new TokenRepository;