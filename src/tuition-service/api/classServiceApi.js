import axios from "axios";
import { logger } from "#shared/utils/index.js";
import { LambdaInvoker } from "../utils/index.js";

const CLASS_SERVICE = process.env.CLASS_SERVICE_API; // Development: localhost URL, Production: Lambda function name

class ClassServiceClient {
  constructor() {
    this.isProd = process.env.NODE_ENV === "production";

    if (!this.isProd) {
      this.api = axios.create({ baseURL: CLASS_SERVICE });
    } else {
      this.lambda = new LambdaInvoker();
    }
  }

  async getClassById(id, accessToken) {
    const route = `/${id}`;
    try {
      if (!this.isProd) {
        const res = await this.api.get(route, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
      }
      return await this.lambda.invoke("GET", route, accessToken, CLASS_SERVICE);
    } catch (err) {
      if (!this.isProd) {
        logger.error(`Class API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
      } else {
        logger.error("ClassService error:", err);
      }
    }
  }

  async getUserClass(classId, userId, accessToken) {
    const route = `/${classId}/permissions?user_id=${userId}`;
    try {
      if (!this.isProd) {
        const res = await this.api.get(route, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
      }
      return await this.lambda.invoke("GET", route, accessToken, CLASS_SERVICE);
    } catch (err) {
      if (!this.isProd) {
        logger.error(`Class API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
      } else {
        logger.error("ClassService error:", err);
      }
    }
  }

  async checkStudentEnrollment(classId, studentId, accessToken) {
    const route = `/${classId}/students/${studentId}`;
    try {
      if (!this.isProd) {
        const res = await this.api.get(route, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
      }
      return await this.lambda.invoke("GET", route, accessToken, CLASS_SERVICE);
    } catch (err) {
      if (!this.isProd) {
        logger.error(`Class API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
      } else {
        logger.error("ClassService error:", err);
      }
    }
  }
}

export default new ClassServiceClient();