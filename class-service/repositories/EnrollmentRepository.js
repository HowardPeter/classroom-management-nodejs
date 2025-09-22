import BaseRepository from "./BaseRepository.js";
import prisma from '../db/prismaClient.js';

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(prisma.enrollment, "enrollment");
  }

  patterns() {
    return [
      ...super.patterns(),
      "class:one:*",
      "class:list:*",
      "class:count:*"
    ];
  }
}

export default new EnrollmentRepository();