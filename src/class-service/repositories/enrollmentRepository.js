import BaseRepository from "./baseRepository.js";
import prisma from '../db/prismaClient.js';
import { RedisCache } from '#shared/utils/index.js';

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(prisma.enrollment, "enrollment");
  }

  patterns() {
    return [
      ...super.patterns(),
      this.buildKey("one:*"),
      "class:one:*",
      "class:list:*",
      "class:count:*"
    ];
  }

  async findByClassId(classId) {
    const key = this.buildKey(`list:${classId}`)
    return await RedisCache.cacheRead(key, () =>
      this.model.findMany({
        where: { class_id: classId }
      })
    )
  }
}

export default new EnrollmentRepository();