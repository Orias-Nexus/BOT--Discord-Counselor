/**
 * Monitoring Middleware — theo dõi request metrics (count, latency, errors).
 * Expose qua endpoint /api/metrics cho Dashboard hoặc alerting.
 */

const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  statusCodes: {},
  avgResponseTimeMs: 0,
  _responseTimes: [],    // sliding window 1000 entries
  startedAt: new Date().toISOString(),
};

const MAX_WINDOW = 1000;

/**
 * Express middleware: đếm request, tính response time, phân loại status code.
 */
export function monitoringMiddleware(req, res, next) {
  const start = Date.now();
  metrics.totalRequests++;

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Track status codes
    const code = res.statusCode;
    metrics.statusCodes[code] = (metrics.statusCodes[code] || 0) + 1;

    if (code >= 400) {
      metrics.totalErrors++;
    }

    // Sliding window for avg response time
    metrics._responseTimes.push(duration);
    if (metrics._responseTimes.length > MAX_WINDOW) {
      metrics._responseTimes.shift();
    }
    metrics.avgResponseTimeMs = Math.round(
      metrics._responseTimes.reduce((a, b) => a + b, 0) / metrics._responseTimes.length
    );
  });

  next();
}

/**
 * Lấy snapshot metrics hiện tại.
 */
export function getMetrics() {
  return {
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    errorRate: metrics.totalRequests > 0
      ? `${((metrics.totalErrors / metrics.totalRequests) * 100).toFixed(2)}%`
      : '0%',
    avgResponseTimeMs: metrics.avgResponseTimeMs,
    statusCodes: { ...metrics.statusCodes },
    startedAt: metrics.startedAt,
    sampledRequests: metrics._responseTimes.length,
  };
}
