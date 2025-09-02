import BaseRepository from "./BaseRepository.js";
import prisma from '../prismaClient.js'

class ClassRepository extends BaseRepository {
  constructor() {
    super(prisma.class);
  }

  async findById(id) {
    return await this.model.findUnique({
      where: { class_id: id },
      include: {
        userClasses: true,
        enrollments: true
      }
    })
  }

  async updateById(id, data) {
    return await this.model.update({
      where: { class_id: id },
      data: data,
    });
  }

  async deleteById(id) {
    return await this.model.delete({
      where: { class_id: id },
    });
  }
}

export default new ClassRepository();