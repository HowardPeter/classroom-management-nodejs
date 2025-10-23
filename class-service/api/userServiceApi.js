import axios from "axios";
import { InternalServerError } from "#shared/errors/errors.js";

const URL = process.env.USER_SERVICE_URL;

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