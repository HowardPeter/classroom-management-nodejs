import BaseRepository from "./BaseRepository.js";
import prisma from '../prismaClient.js'

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(prisma.enrollment);
  }
}

export default new EnrollmentRepository();