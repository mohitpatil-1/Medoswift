import { env } from "../config/env.js";

export function notFound(_req, _res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Only log server (5xx) errors to avoid noisy 404 logs in dev
  if (env.nodeEnv !== "production" && status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(env.nodeEnv !== "production" ? { stack: err.stack } : {}),
  });
}
