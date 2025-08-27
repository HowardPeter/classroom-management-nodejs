import { Token } from "../models/Models.js";
import BaseRepository from "./BaseRepository.js";

class TokenRepository extends BaseRepository {
  constructor() {
    super(Token)
  }

  async deleteByToken(token) {
    return await this.model.deleteOne({ refreshToken: token })
  }
}

export default new TokenRepository;