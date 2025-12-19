'use strict';

const DEFAULT_THRESHOLDS = { // default performance thresholds
  maxEventLoopLag: 25, // 25ms max lag before alert
  maxCpuUsage: 80, // 80% max CPU before alert
  maxMemoryUsage: 85, // 85% max heap before alert
  maxResponseTime: 2000, // 2s max response time before alert
  minThroughput: 10 // 10 req/min minimum before alert
};

/**
 * Analyzes performance metrics against thresholds and generates alerts
 * @param {Object} metrics - Performance metrics to analyze
 * @param {number} metrics.eventLoopLag - Event loop lag in ms
 * @param {number} metrics.cpuUsage - CPU usage percentage
 * @param {number} metrics.heapUsedPercent - Heap usage percentage
 * @param {number} metrics.responseTime - Average response time in ms
 * @param {number} metrics.throughput - Requests per minute
 * @param {Object} [thresholds] - Custom thresholds (optional)
 * @param {number} [requestCount] - Total request count (used for throughput check)
 * @returns {Array<Object>} Array of alert objects
 * @example
 * const alerts: any = analyzePerformanceMetrics({ eventLoopLag: 50, cpuUsage: 90, ... });
 * // returns [{ type: 'event_loop', severity: 'critical', ... }]
 */
function analyzePerformanceMetrics(metrics, thresholds = {}, requestCount = 0) { // analyze metrics and generate alerts
  if (!metrics || typeof metrics !== 'object') { // validate input
    throw new Error('Metrics must be an object');
  }

  const config: any = { ...DEFAULT_THRESHOLDS, ...thresholds }; // merge with defaults
  const alerts: any = []; // collect alerts
  const timestamp: any = Date.now(); // alert timestamp

  if (typeof metrics.eventLoopLag === 'number' && metrics.eventLoopLag > config.maxEventLoopLag) { // check event loop
    alerts.push({
      type: 'event_loop',
      severity: 'critical',
      message: `Event loop lag exceeded: ${metrics.eventLoopLag.toFixed(2)}ms`,
      value: metrics.eventLoopLag,
      threshold: config.maxEventLoopLag,
      timestamp
    });
  }

  if (typeof metrics.cpuUsage === 'number' && metrics.cpuUsage > config.maxCpuUsage) { // check CPU
    alerts.push({
      type: 'cpu',
      severity: 'critical',
      message: `CPU usage exceeded: ${metrics.cpuUsage.toFixed(2)}%`,
      value: metrics.cpuUsage,
      threshold: config.maxCpuUsage,
      timestamp
    });
  }

  if (typeof metrics.heapUsedPercent === 'number' && metrics.heapUsedPercent > config.maxMemoryUsage) { // check memory
    alerts.push({
      type: 'memory',
      severity: 'critical',
      message: `Memory usage exceeded: ${metrics.heapUsedPercent.toFixed(2)}%`,
      value: metrics.heapUsedPercent,
      threshold: config.maxMemoryUsage,
      timestamp
    });
  }

  if (typeof metrics.responseTime === 'number' && metrics.responseTime > config.maxResponseTime) { // check response time
    alerts.push({
      type: 'response_time',
      severity: 'warning',
      message: `Response time exceeded: ${metrics.responseTime.toFixed(2)}ms`,
      value: metrics.responseTime,
      threshold: config.maxResponseTime,
      timestamp
    });
  }

  const hasRequests: any = requestCount > 0 || (Array.isArray(metrics.requestTimestamps) && metrics.requestTimestamps.length > 0); // check if any requests recorded
  if (typeof metrics.throughput === 'number' && metrics.throughput < config.minThroughput && hasRequests) { // check throughput
    alerts.push({
      type: 'throughput',
      severity: 'warning',
      message: `Throughput below threshold: ${metrics.throughput.toFixed(2)} req/min`,
      value: metrics.throughput,
      threshold: config.minThroughput,
      timestamp
    });
  }

  return alerts; // return all generated alerts
}

export default analyzePerformanceMetrics;
