import mongoose from "mongoose";
import { User } from "../models/Models.js";
import BaseRepository from "./BaseRepository.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User)
  }

  async updatePasswordById(id, newPassword) {
    return await this.model.updateOne(
      { _id: id },
      { $set: { password: newPassword } }
    )
  }

  async findNameByIds(ids = [], options = {}) {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const objectIds = ids
      .filter(id => mongoose.Types.ObjectId.isValid(id)) // lọc string hợp lệ
      .map(id => mongoose.Types.ObjectId.createFromHexString(id)); // convert sang ObjectId

    return await this.model.find(
      { _id: { $in: objectIds } },
      { _id: 1, username: 1 }, // trả về _id và username
      options
    );
  }
}

export default new UserRepository;