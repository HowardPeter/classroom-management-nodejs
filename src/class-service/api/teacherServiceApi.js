import axios from "axios";
import { LambdaInvoker } from "../utils/index.js";
import { logger } from "#shared/utils/index.js";

const TEACHER_SERVICE = process.env.TEACHER_SERVICE_API; // Development: localhost URL, Production: Lambda function name

class TeacherServiceClient {
  constructor() {
    this.isProd = process.env.NODE_ENV === "production";

    if (!this.isProd) {
      this.api = axios.create({ baseURL: TEACHER_SERVICE });
    } else {
      this.lambda = new LambdaInvoker();
    }
  }

  async getTeacherById(id, accessToken) {
    const route = `/${id}`;
    try {
      if (!this.isProd) {
        const res = await this.api.get(route, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
      }
      return await this.lambda.invoke("GET", route, accessToken, TEACHER_SERVICE);
    } catch (err) {
      if (!this.isProd) {
        logger.error(`Student API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
      } else {
        logger.error("StudentService error:", err);
      }
    }
  }
}

export default new TeacherServiceClient();