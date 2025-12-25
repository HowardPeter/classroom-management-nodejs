import axios from "axios";
import { LambdaInvoker } from "../utils/index.js";
import { logger } from "#shared/utils/index.js";

const USER_SERVICE = process.env.USER_SERVICE_API; // Development: localhost URL, Production: Lambda function name

class UserServiceClient {
  constructor() {
    this.isProd = process.env.NODE_ENV === "production";

    if (!this.isProd) {
      this.api = axios.create({ baseURL: USER_SERVICE });
    } else {
      this.lambda = new LambdaInvoker();
    }
  }

  async getUserByIds(ids, accessToken) {
    const route = `/by-ids?ids=${ids}`;
    try {
      if (!this.isProd) {
        const res = await this.api.get(route, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
      }
      return await this.lambda.invoke("GET", route, accessToken, USER_SERVICE);
    } catch (err) {
      if (!this.isProd) {
        logger.error(`Student API returned ${err.response.status}: ${err.response.data?.msg || err.message}`);
      } else {
        logger.error("StudentService error:", err);
      }
    }
  }
}

export default new UserServiceClient();