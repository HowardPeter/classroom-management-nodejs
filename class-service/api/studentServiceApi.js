import axios from "axios";
import { InternalServerError } from "#shared/errors/errors.js";

const URL = "http://student:3002/students";

class StudentServiceClient {
  constructor(baseURL) {
    this.api = axios.create({ baseURL });
  }

  async getStudentByIds(ids, accessToken) {
    try {
      const res = await this.api.get(`/by-ids?ids=${ids}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      throw new InternalServerError(`Student API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
    }
  }

  async getStudentById(id, accessToken) {
    try {
      const res = await this.api.get(`/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      throw new InternalServerError(`Student API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
    }
  }

  async deleteStudentById(id, accessToken) {
    try {
      const res = await this.api.delete(`/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      throw new InternalServerError(`Student API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
    }
  }
}

export default new StudentServiceClient(URL);
