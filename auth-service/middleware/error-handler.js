import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: process.env.NODE_ENV === "production"
    ? undefined
    : { target: "pino-pretty", options: { colorize: true } }
});

// Bắt các next(err) hoặc throw new Error
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";

  logger.error(err.stack, message);
  console.log("\n");
  
  return res.status(status).json({
    success: false,
    status,
    error: message
  });
}