import axios from "axios";
import { InternalServerError } from "../../student-service/errors/errors";

const URL = "http://localhost:3002"

class StudentServiceClient {
  constructor(baseURL) {
    this.api = axios.create({ baseURL });
  }

  async getStudentById(id) {
    try {
      const res = await this.api.get(`/student/${id}`);
      return res.data;
    } catch (err) {
      throw new InternalServerError("Failed to fetch student API!");
    }
  }
}

export default StudentServiceClient(URL);