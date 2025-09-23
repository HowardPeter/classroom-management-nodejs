import prisma from '../db/prismaClient.js';
import { RedisCache } from '#shared/utils/index.js';

const patterns = ["teacher:list:*", "teacher:count:*"];

class TeacherRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async count(filter = {}) {
    const key = `teacher:count:${JSON.stringify(filter)}`;
    return await RedisCache.cacheRead(key, () =>
      this.prisma.teacher.count({ where: filter })
    );
  }

  // Lấy danh sách teacher (có filter, skip, take)
  async findMany(filter = {}, options = {}) {
    const key = RedisCache.generateKey("teacher:list", { filter, options });
    return await RedisCache.cacheRead(key, () =>
      this.prisma.teacher.findMany({
        where: filter,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
      })
    );
  }

  async findById(id) {
    const key = `teacher:${id}`;
    return await RedisCache.cacheRead(key, () =>
      this.prisma.teacher.findUnique({
        where: { teacher_id: id },
      })
    );
  }

  async createOne(data) {
    return await RedisCache.cacheWrite("", (payload) =>
      this.prisma.teacher.create({ data: payload }),
      data, patterns
    );
  }

  async updateById(id, data) {
    const key = `teacher:${id}`;
    return await RedisCache.cacheWrite(key, (payload) =>
      this.prisma.teacher.update({
        where: { teacher_id: id },
        data: payload,
      }),
      data, patterns
    );
  }

  async deleteById(id) {
    const key = `teacher:${id}`;
    return await RedisCache.cacheWrite(key, () =>
      this.prisma.teacher.delete({ where: { teacher_id: id } }),
      {}, patterns
    );
  }
}

export default new TeacherRepository(prisma);