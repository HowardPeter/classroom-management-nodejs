import BaseRepository from "./BaseRepository.js";
import prisma from '../db/prismaClient.js';
import { RedisCache } from '#shared/utils/index.js';

class ClassRepository extends BaseRepository {
  constructor() {
    super(prisma.class, "class");
  }

  patterns() {
    return [
      ...super.patterns(),
      "userclass:one:*",
      "userclass:list:*",
      "enrollment:one:*",
      "enrollment:list:*",
    ];
  }

  async findById(id) {
    const key = this.buildKey(`one:${id}`);
    return await RedisCache.cacheRead(key, () =>
      this.model.findUnique({
        where: { class_id: id },
        include: {
          userClasses: true,
          enrollments: true
        }
      })
    )
  }

  async updateById(id, data) {
    const key = this.buildKey(`one:${id}`);
    return await RedisCache.cacheWrite(key, (payload) =>
      this.model.update({
        where: { class_id: id },
        data: payload,
      }),
      data, this.patterns()
    )
  }

  async deleteById(id) {
    const key = this.buildKey(`one:${id}`);
    return await RedisCache.cacheWrite(key, () =>
      this.model.delete({
        where: { class_id: id },
      }),
      {}, this.patterns()
    )
  }
}

export default new ClassRepository();