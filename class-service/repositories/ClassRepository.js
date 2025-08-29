import BaseRepository from "./BaseRepository.js";
import prisma from '../prismaClient.js'

class ClassRepository extends BaseRepository {
  constructor() {
    super(prisma.class);
  }

  async findById(id) {
    return await this.model.findUnique({
      where: { class_id: id }
    })
  }

  async findWithTableJoin(filter = {}, options = {}) {
    return await this.model.findMany({
      include: {
        userClasses: true,
        enrollments: true
      },
      where: filter,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy,
    });
  }

  async updateById(id, data) {
    return await this.model.update({
      where: { class_id: id },
      data: data,
    });
  }
}

export default ClassRepository;