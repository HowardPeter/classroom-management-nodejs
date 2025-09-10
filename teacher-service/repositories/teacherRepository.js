import prisma from '../prismaClient.js';

class TeacherRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async count(filter = {}) {
    return await this.prisma.teacher.count({
      where: filter,
    });
  }

  // Lấy danh sách teacher (có filter, skip, take)
  async findMany(filter = {}, options = {}) {
    return await this.prisma.teacher.findMany({
      where: filter,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy,
    });
  }

  async findById(id) {
    return await this.prisma.teacher.findUnique({
      where: { student_id: id },
    });
  }

  async findOne(filter = {}) {
    return await this.prisma.teacher.findFirst({
      where: filter,
    });
  }

  async createOne(data) {
    return await this.prisma.teacher.create({ data: data });
  }

  async updateById(id, data) {
    return await this.prisma.teacher.update({
      where: { student_id: id },
      data: data,
    });
  }

  async deleteById(id) {
    return await this.prisma.teacher.delete({
      where: { student_id: id },
    });
  }
}

export default new TeacherRepository(prisma);