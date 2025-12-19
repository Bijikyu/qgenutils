/**
 * Performance metric utilities for common calculations and data collection
 */

/**
 * Rounds a number to specified decimal places
 * @param {number} value - The value to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded value
 */
function roundToDecimals(value, decimals = 2) {
  const factor: any = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculates memory usage percentages
 * @param {Object} memoryUsage - Process memory usage from process.memoryUsage()
 * @returns {Object} Memory usage data with percentages
 */
function calculateMemoryMetrics(memoryUsage) {
  const heapUsedPercent = memoryUsage.heapTotal > 0 
    ? (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100 
    : 0;

  const externalPercent = memoryUsage.total > 0 
    ? (memoryUsage.external / memoryUsage.total) * 100 
    : 0;

  return {
    ...memoryUsage,
    heapUsedPercent: roundToDecimals(heapUsedPercent),
    externalPercent: roundToDecimals(externalPercent),
    heapUsedMB: roundToDecimals(memoryUsage.heapUsed / 1024 / 1024),
    heapTotalMB: roundToDecimals(memoryUsage.heapTotal / 1024 / 1024),
    rssMB: roundToDecimals(memoryUsage.rss / 1024 / 1024),
    externalMB: roundToDecimals(memoryUsage.external / 1024 / 1024)
  };
}

/**
 * Calculates CPU usage percentage
 * @param {Object} currentCpuUsage - Current CPU usage from process.cpuUsage()
 * @param {Object} previousCpuUsage - Previous CPU usage
 * @param {number} elapsedMs - Elapsed time in milliseconds
 * @returns {Object} CPU usage metrics
 */
function calculateCpuMetrics(currentCpuUsage, previousCpuUsage = null, elapsedMs = 1000) {
  if (!previousCpuUsage) {
    return {
      userPercent: 0,
      systemPercent: 0,
      totalPercent: 0
    };
  }

  const userDiff: any = currentCpuUsage.user - previousCpuUsage.user;
  const systemDiff: any = currentCpuUsage.system - previousCpuUsage.system;
  const totalDiff: any = userDiff + systemDiff;

  // Convert microseconds to milliseconds and calculate percentage
  const userPercent: any = (userDiff / 1000) / elapsedMs * 100;
  const systemPercent: any = (systemDiff / 1000) / elapsedMs * 100;
  const totalPercent: any = (totalDiff / 1000) / elapsedMs * 100;

  return {
    userPercent: Math.max(0, roundToDecimals(userPercent)),
    systemPercent: Math.max(0, roundToDecimals(systemPercent)),
    totalPercent: Math.max(0, roundToDecimals(totalPercent))
  };
}

/**
 * Calculates elapsed time metrics
 * @param {number} startTime - Start timestamp in milliseconds
 * @param {number} endTime - End timestamp in milliseconds (default: current time)
 * @returns {Object} Elapsed time metrics
 */
function calculateTimeMetrics(startTime, endTime = Date.now()) {
  const elapsedMs: any = Math.max(1, endTime - startTime);
  const elapsedSeconds: any = elapsedMs / 1000;
  const elapsedMinutes: any = elapsedSeconds / 60;

  return {
    startTime,
    endTime,
    elapsedMs,
    elapsedSeconds: roundToDecimals(elapsedSeconds),
    elapsedMinutes: roundToDecimals(elapsedMinutes)
  };
}

/**
 * Creates a standardized performance metrics object
 * @param {Object} options - Metrics collection options
 * @returns {Object} Standardized performance metrics
 */
function createPerformanceMetrics(options = {}) {
  const {
    startTime = Date.now(),
    lastCpuUsage = null,
    includeMemory = true,
    includeCpu = true
  } = options;

  const metrics = {
    timestamp: new Date().toISOString(),
    ...calculateTimeMetrics(startTime)
  };

  if (includeMemory) {
    metrics.memory = calculateMemoryMetrics(process.memoryUsage());
  }

  if (includeCpu) {
    const currentCpuUsage: any = process.cpuUsage(lastCpuUsage);
    metrics.cpu = calculateCpuMetrics(currentCpuUsage, lastCpuUsage, metrics.elapsedMs);
  }

  return metrics;
}

/**
 * Determines performance health status based on metrics
 * @param {Object} metrics - Performance metrics
 * @param {Object} thresholds - Health threshold values
 * @returns {string} Health status: 'healthy', 'warning', or 'critical'
 */
function determineHealthStatus(metrics, thresholds = {}) {
  const {
    memoryThreshold = 80,
    cpuThreshold = 70,
    responseTimeThreshold = 5000
  } = thresholds;

  // Check memory usage
  if (metrics.memory && metrics.memory.heapUsedPercent > memoryThreshold) {
    return metrics.memory.heapUsedPercent > 90 ? 'critical' : 'warning';
  }

  // Check CPU usage
  if (metrics.cpu && metrics.cpu.totalPercent > cpuThreshold) {
    return metrics.cpu.totalPercent > 90 ? 'critical' : 'warning';
  }

  // Check response time
  if (metrics.elapsedMs > responseTimeThreshold) {
    return metrics.elapsedMs > 10000 ? 'critical' : 'warning';
  }

  return 'healthy';
}

export default {
  roundToDecimals,
  calculateMemoryMetrics,
  calculateCpuMetrics,
  calculateTimeMetrics,
  createPerformanceMetrics,
  determineHealthStatus
};