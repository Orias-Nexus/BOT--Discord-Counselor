/**
 * Global Error Handler — middleware Express xử lý lỗi tập trung.
 * Ghi log chi tiết qua Winston, trả response chuẩn cho client.
 */
import { logger } from './logger.js';

/**
 * Express error-handling middleware (4 tham số).
 * Đặt sau tất cả routes: app.use(errorHandler);
 */
export function errorHandler(err, req, res, _next) {
  // Determine HTTP status
  const status = err.status || err.statusCode || 500;
  const isServerError = status >= 500;

  // Log error details
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    status,
    message: err.message,
    ...(isServerError && { stack: err.stack }),
  };

  if (isServerError) {
    logger.error(`[ERROR] ${req.method} ${req.originalUrl} → ${status}: ${err.message}`, logPayload);
  } else {
    logger.warn(`[WARN] ${req.method} ${req.originalUrl} → ${status}: ${err.message}`);
  }

  // Send structured error response
  res.status(status).json({
    error: {
      message: isServerError ? 'Internal Server Error' : err.message,
      status,
      ...(process.env.NODE_ENV !== 'production' && { detail: err.message, stack: err.stack }),
    },
  });
}

/**
 * 404 handler — đặt trước errorHandler, sau tất cả routes.
 */
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      status: 404,
    },
  });
}
