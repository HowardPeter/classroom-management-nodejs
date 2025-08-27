import { User } from "../models/Models.js";
import BaseRepository from "./BaseRepository.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User)
  }

  async updatePasswordById(id, newPassword){
    return await this.model.updateOne(
      {_id: id}, 
      { $set: { password: newPassword } }
    )
  }
}

export default new UserRepository;