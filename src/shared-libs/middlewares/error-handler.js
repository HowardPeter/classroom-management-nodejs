import { logger } from "#shared/utils/index.js";

// Bắt các next(err) hoặc throw new Error
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";

  logger.error(err.stack, message, "\n");

  return res.status(status).json({
    success: false,
    status,
    error: message
  });
}