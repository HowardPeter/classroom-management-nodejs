import BaseRepository from "./BaseRepository.js";
import prisma from '../db/prismaClient.js';

class UserClassRepository extends BaseRepository {
  constructor() {
    super(prisma.userClass, "userclass");
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

export default new UserClassRepository();