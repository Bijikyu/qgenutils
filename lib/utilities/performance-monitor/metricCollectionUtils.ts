'use strict';

/**
 * Creates a performance state manager for tracking metrics over time
 * @param {Object} [initialState={}] - Initial state object
 * @returns {Object} State manager with getters and setters
 */
function createPerformanceState(initialState = {}) {
  let state = {
    lastCpuUsage: process.cpuUsage(),
    responseTimes: [] as number[],
    requestTimestamps: [] as number[],
    lastCollectionTime: Date.now(),
    requestCount: 0,
    ...initialState
  };

  return {
    get(key) {
      return state[key];
    },

    set(key, value) {
      state[key] = value;
    },

    getAll() {
      return { ...state };
    },

    update(updates) {
      state = { ...state, ...updates };
    },

    // Array management helpers
    addToResponseTime(time) {
      state.responseTimes.push(time);
      if (state.responseTimes.length > 100) {
        state.responseTimes.shift();
      }
    },

    addRequestTimestamp() {
      state.requestTimestamps.push(Date.now());
      if (state.requestTimestamps.length > 1000) {
        state.requestTimestamps = state.requestTimestamps.slice(-500);
      }
    },

    incrementRequestCount() {
      state.requestCount++;
    },

    // Cleanup helpers
    cleanupResponseTimes() {
      state.responseTimes = [];
    },

    cleanupRequestTimestamps() {
      state.requestTimestamps = [];
    },

    reset() {
      state = {
        lastCpuUsage: process.cpuUsage(),
        responseTimes: [],
        requestTimestamps: [],
        lastCollectionTime: Date.now(),
        requestCount: 0,
        ...initialState
      };
    }
  };
}

/**
 * Collects system performance metrics
 * @param {Object} state - Performance state object
 * @returns {Object} System metrics object
 */
function collectSystemMetrics(state) {
  const now: any = Date.now();
  const lastCpuUsage: any = state.lastCpuUsage || process.cpuUsage();
  const lastCollectionTime: any = state.lastCollectionTime || now;

  // Memory metrics
  const memoryUsage: any = process.memoryUsage();
  const heapUsedPercent = memoryUsage.heapTotal > 0 
    ? (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100 
    : 0;

  // CPU metrics
  const elapsedMs: any = Math.max(1, now - lastCollectionTime);
  const currentCpuUsage: any = process.cpuUsage(lastCpuUsage);
  const totalCpuTime: any = currentCpuUsage.user + currentCpuUsage.system;
  const cpuUsage: any = Math.min(100, (totalCpuTime / (elapsedMs * 1000)) * 100);

  // Process metrics
  let activeHandles = 0;
  let activeRequests = 0;

  if (typeof (process as any)._getActiveHandles === 'function') {
    activeHandles = (process as any)._getActiveHandles().length;
  }

  if (typeof (process as any)._getActiveRequests === 'function') {
    activeRequests = (process as any)._getActiveRequests().length;
  }

  return {
    timestamp: now,
    memory: {
      ...memoryUsage,
      heapUsedPercent: Math.round(heapUsedPercent * 100) / 100
    },
    cpu: {
      usage: Math.round(cpuUsage * 100) / 100,
      userTime: currentCpuUsage.user,
      systemTime: currentCpuUsage.system
    },
    process: {
      activeHandles,
      activeRequests,
      pid: process.pid,
      uptime: process.uptime()
    }
  };
}

/**
 * Calculates application-level metrics from state
 * @param {Object} state - Performance state object
 * @returns {Object} Application metrics object
 */
function calculateApplicationMetrics(state) {
  const { responseTimes, requestTimestamps }: any = state;
  const now: any = Date.now();

  // Response time metrics
  let avgResponseTime = 0;
  let minResponseTime = 0;
  let maxResponseTime = 0;
  let p95ResponseTime = 0;

  if (responseTimes.length > 0) {
    const sorted: any = [...responseTimes].sort((a, b) => a - b);
    avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    minResponseTime = sorted[0];
    maxResponseTime = sorted[sorted.length - 1];
    p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)] || 0;
  }

  // Throughput metrics
  const oneMinuteAgo: any = now - 60000;
  const recentRequests: any = requestTimestamps.filter(ts => ts > oneMinuteAgo);
  const throughput: any = recentRequests.length; // requests per minute

  // Request rate (requests per second over last minute)
  const requestRate: any = throughput / 60;

  return {
    responseTime: {
      average: Math.round(avgResponseTime * 100) / 100,
      min: Math.round(minResponseTime * 100) / 100,
      max: Math.round(maxResponseTime * 100) / 100,
      p95: Math.round(p95ResponseTime * 100) / 100,
      count: responseTimes.length
    },
    throughput: {
      requestsPerMinute: throughput,
      requestsPerSecond: Math.round(requestRate * 100) / 100,
      totalRequests: state.requestCount
    }
  };
}

/**
 * Updates performance state with new metrics
 * @param {Object} state - Current performance state
 * @param {Object} [options={}] - Update options
 * @returns {Object} Updated state object
 */
function updatePerformanceState(state, _options = {}) {
  const now: any = Date.now();

  // Update CPU usage baseline
  state.lastCpuUsage = process.cpuUsage();
  state.lastCollectionTime = now;

  // Clean up old timestamps
  const oneMinuteAgo: any = now - 60000;
  state.requestTimestamps = state.requestTimestamps.filter(ts => ts > oneMinuteAgo);

  return state;
}

/**
 * Creates a metrics collector with state management
 * @param {Object} [options] - Collector options
 * @param {number} [options.maxResponseTimes=100] - Max response times to keep
 * @param {number} [options.maxRequestTimestamps=500] - Max request timestamps to keep
 * @returns {Object} Metrics collector object
 */
function createMetricsCollector(_options = {}) {
  const _maxResponseTimes: any = 100;
  const _maxRequestTimestamps: any = 500;
  
  const state: any = createPerformanceState();

  return {
    /**
     * Collects all performance metrics
     * @returns {Object} Complete metrics object
     */
    collect() {
      const systemMetrics: any = collectSystemMetrics(state.getAll());
      const appMetrics: any = calculateApplicationMetrics(state.getAll());
      
      return {
        ...systemMetrics,
        ...appMetrics
      };
    },

    /**
     * Records a request response time
     * @param {number} responseTime - Response time in milliseconds
     */
    recordResponseTime(responseTime) {
      if (typeof responseTime !== 'number' || responseTime < 0) {
        throw new Error('Response time must be a non-negative number');
      }
      state.addToResponseTime(responseTime);
      state.incrementRequestCount();
      state.addRequestTimestamp();
    },

    /**
     * Records a request (for throughput tracking)
     */
    recordRequest() {
      state.incrementRequestCount();
      state.addRequestTimestamp();
    },

    /**
     * Gets current state
     * @returns {Object} Current performance state
     */
    getState() {
      return state.getAll();
    },

    /**
     * Resets all metrics
     */
    reset() {
      state.reset();
    },

    /**
     * Gets performance summary
     * @returns {Object} Performance summary
     */
    getSummary() {
      const metrics: any = this.collect();
      return {
        cpuUsage: metrics.cpu.usage,
        memoryUsage: metrics.memory.heapUsedPercent,
        avgResponseTime: metrics.responseTime.average,
        throughput: metrics.throughput.requestsPerMinute,
        timestamp: metrics.timestamp
      };
    }
  };
}

/**
 * Measures event loop lag asynchronously
 * @param {Function} callback - Callback function that receives lag in milliseconds
 */
function measureEventLoopLag(callback: any) {
  const start: any = process.hrtime.bigint();
  
  setImmediate((): any => {
    const end: any = process.hrtime.bigint();
    const lagMs: any = Number(end - start) / 1000000; // Convert nanoseconds to milliseconds
    callback(Math.round(lagMs * 100) / 100); // Round to 2 decimal places
  });
}

/**
 * Measures event loop lag synchronously
 * @returns {number} Event loop lag in milliseconds
 */
function measureEventLoopLagSync() {
  const start: any = process.hrtime.bigint();
  
  // Block the event loop briefly
  const end: any = process.hrtime.bigint();
  const lagMs: any = Number(end - start) / 1000000;
  
  return Math.round(lagMs * 100) / 100;
}

export default {
  createPerformanceState,
  collectSystemMetrics,
  calculateApplicationMetrics,
  updatePerformanceState,
  createMetricsCollector,
  measureEventLoopLag,
  measureEventLoopLagSync
};