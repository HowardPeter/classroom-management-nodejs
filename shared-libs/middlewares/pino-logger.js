import pinoHttp from "pino-http";
import { logger } from "#shared/utils/index.js";

export const pinoLogger = pinoHttp({
  logger,
  customLogLevel: (res) => {
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode })
  }
});