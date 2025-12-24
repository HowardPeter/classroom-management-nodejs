import axios from "axios";
import { logger } from "#shared/utils/index.js";
import { LambdaInvoker } from "../utils/index.js";

const STUDENT_SERVICE = process.env.STUDENT_SERVICE_API; // Development: localhost URL, Production: Lambda function name

class StudentServiceClient {
  constructor() {
    this.isProd = process.env.NODE_ENV === "production";

    if (!this.isProd) {
      this.api = axios.create({ baseURL: STUDENT_SERVICE });
    } else {
      this.lambda = new LambdaInvoker();
    }
  }

  async getStudentByIds(ids, accessToken) {
    const route = `/by-ids?ids=${ids}`;
    try {
      if (!this.isProd) {
        const res = await this.api.get(route, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
      }
      return await this.lambda.invoke("GET", route, accessToken, STUDENT_SERVICE);
    } catch (err) {
      if (!this.isProd) {
        logger.error(`Student API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
      } else {
        logger.error("StudentService error:", err);
      }
    }
  }

  async getStudentById(id, accessToken) {
    const route = `/${id}`;
    try {
      if (!this.isProd) {
        const res = await this.api.get(route, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
      }
      return await this.lambda.invoke("GET", route, accessToken, STUDENT_SERVICE);
    } catch (err) {
      if (!this.isProd) {
        logger.error(`Student API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
      } else {
        logger.error("StudentService error:", err);
      }
    }
  }
}

export default new StudentServiceClient();