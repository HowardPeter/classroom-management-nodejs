import axios from "axios";
import { InternalServerError } from "../errors/errors.js";

const URL = "http://host.docker.internal:3001/users"

class UserServiceClient {
  constructor(baseURL) {
    this.api = axios.create({ baseURL });
  }

  async getUserByIds(ids, accessToken) {
    try {
      const res = await this.api.get(`/by-ids?ids=${ids}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      throw new InternalServerError(`Auth API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
    }
  }
}

export default new UserServiceClient(URL);