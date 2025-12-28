/**
 * Creates a performance state manager for tracking metrics over time
 * @param {Object} [initialState={}] - Initial state object
 * @returns {Object} State manager with getters and setters
 */

function createPerformanceState(initialState: any = {}) {
  let state = {
    lastCpuUsage: process.cpuUsage(),
    responseTimes: [] as number[],
    requestTimestamps: [] as number[],
    lastCollectionTime: Date.now(),
    requestCount: 0,
    ...initialState
  };

  return {
    getState: () => ({ ...state }),
    setState: (newState: any) => { state = { ...state, ...newState }; },
    updateResponseTime: (time: number) => {
      state.responseTimes.push(time);
      if (state.responseTimes.length > 100) {
        state.responseTimes = state.responseTimes.slice(-100);
      }
    },
    incrementRequestCount: () => { state.requestCount++; },
    updateCpuUsage: () => { state.lastCpuUsage = process.cpuUsage(); },
    getAverageResponseTime: () => {
      if (state.responseTimes.length === 0) return 0;
      const sum = state.responseTimes.reduce((a, b) => a + b, 0);
      return sum / state.responseTimes.length;
    },
    reset: () => {
      state.responseTimes = [];
      state.requestTimestamps = [];
      state.requestCount = 0;
      state.lastCollectionTime = Date.now();
      state.lastCpuUsage = process.cpuUsage();
    }
  };
}

/**
 * Creates a metrics collector for performance monitoring
 */
function createMetricsCollector() {
  const state = createPerformanceState();

  return {
    collectMetrics: () => {
      const now = Date.now();
      const cpuUsage = process.cpuUsage(state.getState().lastCpuUsage);
      const memoryUsage = process.memoryUsage();
      const loadAverage = require('os').loadavg();

      state.incrementRequestCount();
      state.updateCpuUsage();

      return {
        timestamp: now,
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          percentage: 0 // Would need calculation logic
        },
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
        },
        load: loadAverage,
        requestCount: state.getState().requestCount,
        averageResponseTime: state.getAverageResponseTime()
      };
    },
    recordResponseTime: (time: number) => {
      state.updateResponseTime(time);
    },
    getState: () => state.getState(),
    reset: () => state.reset()
  };
}

/**
 * Measures event loop lag using timers
 */
function measureEventLoopLag(): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
      resolve(lag);
    });
  });
}

export {
  createPerformanceState,
  createMetricsCollector,
  measureEventLoopLag
};