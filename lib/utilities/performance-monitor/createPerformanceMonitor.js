'use strict';

const collectPerformanceMetrics = require('./collectPerformanceMetrics'); // metrics collection
const measureEventLoopLag = require('./measureEventLoopLag'); // event loop measurement
const analyzePerformanceMetrics = require('./analyzePerformanceMetrics'); // analysis
const getPerformanceHealthStatus = require('./getPerformanceHealthStatus'); // health status

const DEFAULT_THRESHOLDS = { // default performance thresholds
  maxEventLoopLag: 25, // 25ms max lag
  maxCpuUsage: 80, // 80% max CPU
  maxMemoryUsage: 85, // 85% max heap
  maxResponseTime: 2000, // 2s max response
  minThroughput: 10 // 10 req/min minimum
};

/**
 * Creates a performance monitor instance for real-time monitoring
 * @param {Object} [options] - Configuration options
 * @param {number} [options.maxEventLoopLag=25] - Max event loop lag in ms
 * @param {number} [options.maxCpuUsage=80] - Max CPU usage percentage
 * @param {number} [options.maxMemoryUsage=85] - Max heap usage percentage
 * @param {number} [options.maxResponseTime=2000] - Max response time in ms
 * @param {number} [options.minThroughput=10] - Min requests per minute
 * @param {number} [options.intervalMs=5000] - Monitoring interval in ms
 * @param {Function} [options.onAlert] - Callback for alerts
 * @param {Object} [options.logger] - Logger instance (defaults to console)
 * @returns {Object} Performance monitor instance
 * @example
 * const monitor = createPerformanceMonitor({ maxCpuUsage: 70 });
 * monitor.start();
 * monitor.recordRequest(150); // record 150ms response time
 * const health = monitor.getHealthStatus();
 * monitor.stop();
 */
function createPerformanceMonitor(options = {}) { // factory for performance monitor instance
  const thresholds = { ...DEFAULT_THRESHOLDS }; // initialize thresholds
  const intervalMs = options.intervalMs || 5000; // monitoring interval
  const onAlert = options.onAlert || null; // alert callback
  const logger = options.logger || console; // logger

  if (typeof options.maxEventLoopLag === 'number') thresholds.maxEventLoopLag = options.maxEventLoopLag;
  if (typeof options.maxCpuUsage === 'number') thresholds.maxCpuUsage = options.maxCpuUsage;
  if (typeof options.maxMemoryUsage === 'number') thresholds.maxMemoryUsage = options.maxMemoryUsage;
  if (typeof options.maxResponseTime === 'number') thresholds.maxResponseTime = options.maxResponseTime;
  if (typeof options.minThroughput === 'number') thresholds.minThroughput = options.minThroughput;

  let monitoringInterval = null; // interval timer
  let state = { // monitoring state
    lastCpuUsage: process.cpuUsage(),
    responseTimes: [],
    requestTimestamps: [],
    lastCollectionTime: Date.now()
  };
  let metrics = null; // current metrics
  let alerts = []; // alert history

  function collectAndAnalyze() { // collect metrics and analyze
    const result = collectPerformanceMetrics(state); // collect current metrics
    metrics = result.metrics; // store metrics
    state = result.state; // update state

    measureEventLoopLag((lag) => { // measure event loop async
      metrics.eventLoopLag = lag; // update lag

      const newAlerts = analyzePerformanceMetrics(metrics, thresholds, state.requestCount); // analyze

      for (const alert of newAlerts) { // process each new alert
        alerts.push(alert); // add to history

        if (alerts.length > 50) { // limit history
          alerts.shift();
        }

        if (alert.severity === 'critical') { // log critical alerts
          logger.error(`[performance] CRITICAL: ${alert.message}`);
        } else {
          logger.warn(`[performance] WARNING: ${alert.message}`);
        }

        if (onAlert && typeof onAlert === 'function') { // call alert callback
          try {
            onAlert(alert);
          } catch (err) {
            logger.error('[performance] Alert callback error:', err);
          }
        }
      }

      if (newAlerts.some(a => a.severity === 'critical' && a.type === 'memory')) { // memory optimization
        optimizeMemory();
      }
    });
  }

  function optimizeMemory() { // attempt garbage collection if available
    if (global.gc && typeof global.gc === 'function') {
      try {
        global.gc();
        logger.info('[performance] Forced garbage collection for memory optimization');
      } catch (err) {
        logger.error('[performance] GC failed:', err);
      }
    }
  }

  return {
    start() { // start monitoring
      if (monitoringInterval) { // stop existing if running
        this.stop();
      }

      monitoringInterval = setInterval(collectAndAnalyze, intervalMs); // schedule collection
      logger.info('[performance] Performance monitoring started');
    },

    stop() { // stop monitoring
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
      }
      logger.info('[performance] Performance monitoring stopped');
    },

    isRunning() { // check if monitoring is active
      return monitoringInterval !== null;
    },

    recordRequest(responseTime) { // record a request for throughput/response time tracking
      if (typeof responseTime !== 'number' || responseTime < 0) {
        throw new Error('Response time must be a non-negative number');
      }

      state.requestCount++; // increment request count
      state.responseTimes.push(responseTime); // add response time

      if (state.responseTimes.length > 100) { // limit to last 100
        state.responseTimes.shift();
      }

      state.requestTimestamps.push(Date.now()); // add timestamp for rolling throughput

      if (state.requestTimestamps.length > 1000) { // limit stored timestamps
        state.requestTimestamps = state.requestTimestamps.slice(-500); // keep last 500
      }
    },

    getMetrics() { // get current metrics snapshot
      if (!metrics) { // collect if not yet available
        const result = collectPerformanceMetrics(state);
        return result.metrics;
      }
      return { ...metrics };
    },

    getAlerts(limit = 10) { // get recent alerts
      return alerts.slice(-limit);
    },

    getHealthStatus() { // get health status report
      const currentMetrics = this.getMetrics();
      return getPerformanceHealthStatus(currentMetrics, alerts);
    },

    getThresholds() { // get current thresholds
      return { ...thresholds };
    },

    resetCounters() { // reset all counters
      state.responseTimes = [];
      state.requestTimestamps = [];
      alerts = [];
      logger.info('[performance] Performance counters reset');
    },

    cleanup() { // cleanup for graceful shutdown
      this.stop();
      alerts = [];
      state.responseTimes = [];
      logger.info('[performance] Performance monitor cleaned up');
    }
  };
}

module.exports = createPerformanceMonitor;
