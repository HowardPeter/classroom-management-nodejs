import axios from "axios";
import { InternalServerError } from "#shared/errors/errors.js";

const URL = process.env.TEACHER_SERVICE_URL;

class TeacherServiceClient {
  constructor(baseURL) {
    this.api = axios.create({ baseURL });
  }

  async getTeacherById(id, accessToken) {
    try {
      const res = await this.api.get(`/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      throw new InternalServerError(`Teacher API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
    }
  }
}

export default new TeacherServiceClient(URL);