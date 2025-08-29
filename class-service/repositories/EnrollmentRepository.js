import BaseRepository from "./BaseRepository.js";
import prisma from '../prismaClient.js'

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(prisma.enrollment);
  }

  // async findByClassId(classId) {
  //   return await this.model.findMany({
  //     where: { class_id: classId }
  //   })
  // }
}

export default EnrollmentRepository;