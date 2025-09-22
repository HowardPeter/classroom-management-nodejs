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
      this.buildKey("one:*"),
    ];
  }

  async count(filter = {}) {
    const key = this.buildKey(`count:${JSON.stringify(filter)}`);
    return RedisCache.cacheRead(key, () =>
      this.model.count({ where: filter })
    )
  }

  async findOne(filter = {}) {
    const key = this.buildKey(`one:${JSON.stringify(filter)}`);
    return RedisCache.cacheRead(key, () =>
      this.model.findUnique({ where: filter })
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

  async findByClassId(classId) {
    const key = this.buildKey(`list:${classId}`)
    return await RedisCache.cacheRead(key, () =>
      this.model.findMany({
        where: { class_id: classId }
      })
    )
  }

  async createOne(data) {
    return await RedisCache.cacheWrite("", (payload) =>
      this.model.create({ data: payload }),
      data, this.patterns()
    );
  }

  async updateOne(filter = {}, data) {
    return await RedisCache.cacheWrite("", (payload) =>
      this.model.update({
        where: filter,
        data: payload,
      }),
      data, this.patterns()
    )
  }

  async deleteOne(filter = {}) {
    return await RedisCache.cacheWrite("", () =>
      this.model.delete({
        where: filter,
      }),
      {}, this.patterns()
    )
  }
}

export default BaseRepository;