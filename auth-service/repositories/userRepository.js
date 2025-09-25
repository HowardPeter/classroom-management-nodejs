import mongoose from "mongoose";
import { User } from "../models/Models.js";

class UserRepository {
  constructor(model) {
    this.model = model;
  }

  async findOne(filter = {}) {
    return await this.model.findOne(filter);
  }

  async createOne(data) {
    return await this.model.create(data);
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

  async deleteById(id) {
    return await this.model.deleteOne({ _id: id })
  }
}

export default new UserRepository(User);