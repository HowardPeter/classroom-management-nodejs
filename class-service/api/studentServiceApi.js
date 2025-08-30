import axios from "axios";
import { InternalServerError } from "../errors/errors.js";

const URL = "http://localhost:3002";

class StudentServiceClient {
  constructor(baseURL) {
    this.api = axios.create({ baseURL });
  }

  async getStudentById(ids, accessToken) {
    try {
      const res = await this.api.get(`/students?ids=${ids}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      throw new InternalServerError("Failed to fetch student API!");
    }
  }

  async deleteStudentById(id, accessToken) {
    try {
      const res = await this.api.delete(`/students/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      throw new InternalServerError("Failed to delete student!");
    }
  }
}

export default new StudentServiceClient(URL);
