

/**
 * Collects current performance metrics from the Node.js process
 * @param {Object} state - Optional state object to track CPU usage across calls
 * @param {NodeJS.CpuUsage} [state.lastCpuUsage] - Previous CPU usage for delta calculation
 * @param {number[]} [state.responseTimes] - Array of recent response times
 * @param {number[]} [state.requestTimestamps] - Timestamps of recent requests for rolling throughput
 * @param {number} [state.lastCollectionTime] - Timestamp of last collection for CPU normalization
 * @returns {{metrics: Object, state: Object}} Current metrics and updated state
 * @example
 * const { metrics, state }: any = collectPerformanceMetrics();
 * console.log(metrics.heapUsedPercent); // 45.2
 */
function collectPerformanceMetrics(state: any = {}): any { // collect real-time performance metrics from Node.js process
  const now: any = Date.now(); // current timestamp
  const lastCpuUsage: any = state.lastCpuUsage || process.cpuUsage(); // get previous CPU usage or initialize
  const responseTimes: any = state.responseTimes || []; // response times array
  const requestTimestamps: any = state.requestTimestamps || []; // request timestamps for rolling throughput
  const lastCollectionTime: any = state.lastCollectionTime || now; // last collection time

  const memoryUsage: any = process.memoryUsage(); // get current memory usage

  const elapsedMs: any = Math.max(1, now - lastCollectionTime); // elapsed time since last collection (min 1ms to avoid division by zero)
  const currentCpuUsage: any = process.cpuUsage(lastCpuUsage); // calculate CPU delta since last call
  const totalCpuTime: any = currentCpuUsage.user + currentCpuUsage.system; // total CPU microseconds
  const cpuUsage: any = Math.min(100, (totalCpuTime / (elapsedMs * 1000)) * 100); // normalize to percentage based on actual elapsed time

  const heapUsedPercent: any = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100; // calculate heap utilization

  let activeHandles = 0; // count of active handles
  let activeRequests = 0; // count of active requests

  // These internal APIs are no longer available in modern Node.js
  // Use handle counts via performance monitoring alternatives
  try {
    // Note: In modern Node.js, these APIs are not available
    // This functionality should be replaced with performance metrics alternatives
    activeHandles = 0; // Placeholder - requires modern implementation
    activeRequests = 0; // Placeholder - requires modern implementation
  } catch {
    activeHandles = 0;
    activeRequests = 0;
  }

  let responseTime = 0; // average response time
  if (responseTimes.length > 0) {
    responseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length; // calculate average
  }

  const oneMinuteAgo: any = now - 60000; // timestamp one minute ago
  const recentRequests: any = requestTimestamps.filter(ts => ts > oneMinuteAgo); // filter to last minute
  const throughput: any = recentRequests.length; // requests in the last minute (rolling window)

  return {
    metrics: {
      eventLoopLag: 0, // will be measured async
      cpuUsage: Math.round(cpuUsage * 100) / 100, // round to 2 decimals
      memoryUsage,
      activeHandles,
      activeRequests,
      heapUsedPercent: Math.round(heapUsedPercent * 100) / 100, // round to 2 decimals
      responseTime: Math.round(responseTime * 100) / 100, // round to 2 decimals
      throughput, // requests per minute (rolling window)
      timestamp: now
    },
    state: {
      lastCpuUsage: process.cpuUsage(), // store current for next delta
      responseTimes,
      requestTimestamps: recentRequests, // keep only recent timestamps
      lastCollectionTime: now // store collection time for next CPU normalization
    }
  };
}

export default collectPerformanceMetrics;
