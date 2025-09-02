import prisma from "../models/prismaClient.js";

class StudentRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  async count(filter = {}) {
    return await this.prisma.student.count({
      where: filter,
    });
  }

  // Lấy danh sách student (có filter, skip, take)
  async findMany(filter = {}, options = {}) {
    return await this.prisma.student.findMany({
      where: filter,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy,
    });
  }

  async findById(id) {
    return await this.prisma.student.findUnique({
      where: { student_id: id },
    });
  }

  async findOne(filter = {}) {
    return await this.prisma.student.findFirst({
      where: filter,
    });
  }

  async createOne(data) {
    return await this.prisma.student.create({ data: data });
  }

  async updateById(id, data) {
    return await this.prisma.student.update({
      where: { student_id: id },
      data: data,
    });
  }

  async deleteById(id) {
    return await this.prisma.student.delete({
      where: { student_id: id },
    });
  }

  async deleteMany(ids) {
    return await this.prisma.student.delete({
      where: { student_id: { in: ids } },
    });
  }
}

export default new StudentRepository(prisma);