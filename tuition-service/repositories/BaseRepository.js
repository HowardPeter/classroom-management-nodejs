import { RedisCache } from '#shared/utils/index.js';

class BaseRepository {
  constructor(model, prefixKey) {
    this.model = model;
    this.prefixKey = prefixKey;
  }

  buildKey(suffix) {
    return `${this.prefixKey}:${suffix}`;
  }

  patterns() {
    return [
      this.buildKey("list:*"),
      this.buildKey("count:*"),
    ];
  }

  // Xóa các key liên quan khi cache write
  relatedPatterns(id) {
    return [];
  }

  async count(filter = {}) {
    const key = this.buildKey(`count:${JSON.stringify(filter)}`);
    return RedisCache.cacheRead(key, () =>
      this.model.count({ where: filter })
    )
  }

  async findMany(filter = {}, options = {}) {
    const key = RedisCache.generateKey(`${this.prefixKey}:list`, { filter, options });
    return await RedisCache.cacheRead(key, () =>
      this.model.findMany({
        where: filter,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: options.include || undefined
      })
    )
  }

  async createOne(data) {
    return await RedisCache.cacheWrite("", (payload) =>
      this.model.create({ data: payload }),
      data, this.patterns()
    );
  }
}

export default BaseRepository;
