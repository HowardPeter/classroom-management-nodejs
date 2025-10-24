import axios from "axios";
import { InternalServerError } from "#shared/errors/errors.js";

const URL = process.env.CLASS_SERVICE_URL;

class ClassServiceClient {
  constructor(baseURL) {
    this.api = axios.create({ baseURL });
  }

  async getClassById(id, accessToken) {
    try {
      const res = await this.api.get(`/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return res.data;
    } catch (err) {
      throw new InternalServerError(`Class API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
    }
  }

  async getUserClass(classId, userId, accessToken) {
    try {
      const res = await this.api.get(`/${classId}/permissions?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return res.data;
    } catch (err) {
      throw new InternalServerError(`Class API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
    }
  }
}

export default new ClassServiceClient(URL);