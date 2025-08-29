import BaseRepository from "./BaseRepository.js";
import prisma from '../prismaClient.js';

class UserClassRepository extends BaseRepository {
  constructor() {
    super(prisma.userClass);
  }
}

export default new UserClassRepository();