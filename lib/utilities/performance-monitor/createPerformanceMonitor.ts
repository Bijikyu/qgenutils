'use strict';

import { qerrors } from 'qerrors';
import metricCollectionUtils from './metricCollectionUtils'; // unified metric collection
const { createMetricsCollector, measureEventLoopLag } = metricCollectionUtils; // analysis
const getPerformanceHealthStatus: any = require('./getPerformanceHealthStatus'); // health status
const analyzePerformanceMetrics: any = require('./analyzePerformanceMetrics'); // analysis

interface PerformanceMonitorOptions {
  intervalMs?: number;
  onAlert?: ((alert: any) => void) | null;
  logger?: Console;
  maxEventLoopLag?: number;
  maxCpuUsage?: number;
  maxMemoryUsage?: number;
  maxResponseTime?: number;
  minThroughput?: number;
}

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
 * const monitor: any = createPerformanceMonitor({ maxCpuUsage: 70 });
 * monitor.start();
 * monitor.recordRequest(150); // record 150ms response time
 * const health: any = monitor.getHealthStatus();
 * monitor.stop();
 */
function createPerformanceMonitor(options: PerformanceMonitorOptions = {}) { // factory for performance monitor instance
  const thresholds: any = { ...DEFAULT_THRESHOLDS }; // initialize thresholds
  const intervalMs: any = options.intervalMs || 5000; // monitoring interval
  const onAlert: any = options.onAlert || null; // alert callback
  const logger: any = options.logger || console; // logger

  if (typeof options.maxEventLoopLag === 'number') thresholds.maxEventLoopLag = options.maxEventLoopLag;
  if (typeof options.maxCpuUsage === 'number') thresholds.maxCpuUsage = options.maxCpuUsage;
  if (typeof options.maxMemoryUsage === 'number') thresholds.maxMemoryUsage = options.maxMemoryUsage;
  if (typeof options.maxResponseTime === 'number') thresholds.maxResponseTime = options.maxResponseTime;
  if (typeof options.minThroughput === 'number') thresholds.minThroughput = options.minThroughput;

  const metricsCollector: any = createMetricsCollector(); // unified metric collection
  let monitoringInterval: NodeJS.Timeout | null = null; // interval timer
  let metrics: any = null; // current metrics
  let alerts: any[] = []; // alert history

  function collectAndAnalyze() { // collect metrics and analyze
    metrics = metricsCollector.collect(); // collect current metrics

    measureEventLoopLag((lag: any): any => { // measure event loop async
      // Don't modify metrics directly - return new metrics object
      const updatedMetrics = { ...metrics, eventLoopLag: lag };

      const state: any = metricsCollector.getState();
      const newAlerts: any = analyzePerformanceMetrics(updatedMetrics || {}, thresholds, state.requestCount); // analyze

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
            qerrors(err instanceof Error ? err : new Error(String(err)), 'createPerformanceMonitor', 'Performance alert callback failed');
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

      metricsCollector.recordResponseTime(responseTime); // unified metric recording
    },

    getMetrics() { // get current metrics snapshot
      if (!metrics) { // collect if not yet available
        return metricsCollector.collect();
      }
      return { ...metrics };
    },

    getSummary() { // get performance summary
      return metricsCollector.getSummary();
    },

    getAlerts(limit = 10) { // get recent alerts
      return alerts.slice(-limit);
    },

    getHealthStatus() { // get health status report
      const currentMetrics: any = this.getMetrics();
      return getPerformanceHealthStatus(currentMetrics, alerts);
    },

    getThresholds() { // get current thresholds
      return { ...thresholds };
    },

    resetCounters() { // reset all counters
      metricsCollector.reset();
      alerts = [];
      logger.info('[performance] Performance counters reset');
    },

    cleanup() { // cleanup for graceful shutdown
      this.stop();
      alerts = [];
      metricsCollector.reset();
      logger.info('[performance] Performance monitor cleaned up');
    }
  };
}

export default createPerformanceMonitor;
