import BaseRepository from "./BaseRepository.js";
import prisma from '../prismaClient.js'

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(prisma.userclass);
  }
}

export default EnrollmentRepository;