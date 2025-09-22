import prisma from '../db/prismaClient.js';
import { RedisCache } from '#shared/utils/index.js';

const patterns = ["student:list:*", "student:count:*"];

class StudentRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  // Count students
  async count(filter = {}) {
    const key = `student:count:${JSON.stringify(filter)}`;
    return await RedisCache.cacheRead(key, () =>
      this.prisma.student.count({ where: filter })
    );
  }

  // Lấy danh sách student (filter, skip, take)
  async findMany(filter = {}, options = {}) {
    const key = RedisCache.generateKey("student:list", { filter, options });
    return await RedisCache.cacheRead(key, () =>
      this.prisma.student.findMany({
        where: filter,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
      })
    );
  }

  // Lấy student theo id
  async findById(id) {
    const key = `student:${id}`;
    return await RedisCache.cacheRead(key, () =>
      this.prisma.student.findUnique({
        where: { student_id: id },
      })
    );
  }

  // Tạo student mới
  async createOne(data) {
    return await RedisCache.cacheWrite("", (payload) =>
      this.prisma.student.create({ data: payload }),
      data, patterns
    );
  }

  // Update student
  async updateById(id, data) {
    const key = `student:${id}`;
    return await RedisCache.cacheWrite(key, (payload) =>
      this.prisma.student.update({
        where: { student_id: id },
        data: payload,
      }),
      data, patterns
    );
  }

  // Delete student
  async deleteById(id) {
    const key = `student:${id}`;
    return await RedisCache.cacheWrite(key, () =>
      this.prisma.student.delete({ where: { student_id: id } }),
      {}, patterns
    );
  }
}

export default new StudentRepository(prisma);