

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
// Add a module-level variable to track concurrent calls with timestamps
let inProgress = new Map<string, number>();

// Prevent memory leaks by bounding the in-progress map
const MAX_IN_PROGRESS = 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function enforceMaxInProgress(): void {
  if (inProgress.size >= MAX_IN_PROGRESS) {
    // Remove oldest entries to prevent unbounded growth
    const entries = Array.from(inProgress.entries());
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1] - b[1]);
    // Remove oldest 25% of entries
    const toRemove = Math.floor(MAX_IN_PROGRESS * 0.25);
    for (let i = 0; i < toRemove; i++) {
      inProgress.delete(entries[i][0]);
    }
  }
}

function startCleanupTimer(): void {
  if (cleanupTimer) {
    return;
  }

  cleanupTimer = setInterval(() => {
    try {
      const now = Date.now();
      const staleIds: string[] = [];

      // Enforce size limits before cleanup
      enforceMaxInProgress();

      for (const [id, timestamp] of inProgress.entries()) {
        if (now - timestamp > 30000) { // 30 second timeout
          staleIds.push(id);
        }
      }

      staleIds.forEach(id => inProgress.delete(id));

      // If no more in-progress calls, stop the timer
      if (inProgress.size === 0 && cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
    } catch (error) {
      // Log error but continue timer to prevent cleanup failure
      console.warn('[performance] Cleanup timer error:', error);
    }
  }, CLEANUP_INTERVAL);
}

// Add cleanup function for graceful shutdown
export function stopCleanupTimer(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  inProgress.clear();
}

interface PerformanceState {
  lastCpuUsage?: NodeJS.CpuUsage;
  responseTimes?: number[];
  requestTimestamps?: number[];
  lastCollectionTime?: number;
}

interface PerformanceMetrics {
  metrics: {
    eventLoopLag: number;
    cpuUsage: number;
    memoryUsage: NodeJS.MemoryUsage;
    activeHandles: number;
    activeRequests: number;
    heapUsedPercent: number;
    responseTime: number;
    throughput: number;
    timestamp: number;
  };
  state: {
    lastCpuUsage: NodeJS.CpuUsage;
    responseTimes: number[];
    requestTimestamps: number[];
    lastCollectionTime: number;
  };
}

function collectPerformanceMetrics(state: PerformanceState = {}, callId?: string): PerformanceMetrics { // collect real-time performance metrics from Node.js process
  // Generate unique call ID if not provided for race condition protection
  const now: number = Date.now(); // current timestamp
  const id = callId || `${now}-${Math.random().toString(36).substr(2, 9)}`;

  // Start cleanup timer if needed
  if (inProgress.size > 0 && !cleanupTimer) {
    startCleanupTimer();
  }

  // Check if this call is already in progress to prevent race conditions
  if (inProgress.has(id)) {
    throw new Error(`Concurrent call detected with ID: ${id}`);
  }

  try {
    inProgress.set(id, now);
    const lastCpuUsage: NodeJS.CpuUsage = state.lastCpuUsage || process.cpuUsage(); // get previous CPU usage or initialize
    const responseTimes: number[] = state.responseTimes || []; // response times array
    const requestTimestamps: number[] = state.requestTimestamps || []; // request timestamps for rolling throughput
    const lastCollectionTime: number = state.lastCollectionTime || now; // last collection time

    const memoryUsage: any = process.memoryUsage(); // get current memory usage

    const elapsedMs: number = Math.max(1, Math.abs(now - lastCollectionTime)); // elapsed time since last collection (min 1ms to avoid division by zero)
    const currentCpuUsage: NodeJS.CpuUsage = process.cpuUsage(lastCpuUsage); // calculate CPU delta since last call
    const totalCpuTime: number = currentCpuUsage.user + currentCpuUsage.system; // total CPU microseconds
    const cpuUsage: number = Math.min(100, (totalCpuTime / (elapsedMs * 1000)) * 100); // normalize to percentage based on actual elapsed time

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
      responseTime = responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length; // calculate average
    }

    const oneMinuteAgo: any = now - 60000; // timestamp one minute ago
    const recentRequests: number[] = requestTimestamps.filter((ts: number) => ts > oneMinuteAgo); // filter to last minute
    const throughput: any = recentRequests.length; // requests in the last minute (rolling window)

    const result = {
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

    return result;
  } finally {
    // Always clean up the in-progress flag
    inProgress.delete(id);
  }
}

export default collectPerformanceMetrics;
