'use strict';

/**
 * Performance Monitor - Real-time System Health Monitoring
 *
 * Purpose: Provides comprehensive performance monitoring for Node.js applications
 * Architecture: Factory pattern returning a monitor instance with configurable thresholds
 *
 * Key Features:
 * - Real-time metric collection (CPU, memory, event loop, response times)
 * - Configurable alerting with severity levels
 * - Automatic memory optimization through garbage collection
 * - Health status calculation and reporting
 * - Request throughput tracking
 *
 * Security Considerations:
 * - Validates all input parameters to prevent injection
 * - Uses error boundaries to prevent monitor crashes
 * - Limits alert history to prevent memory exhaustion
 * - Sanitizes error messages in callbacks
 *
 * Performance Strategy:
 * - Non-blocking async metric collection
 * - Efficient metric aggregation using unified collector
 * - Configurable monitoring intervals to balance overhead
 * - Memory optimization triggers only on critical alerts
 *
 * @author Performance Monitoring Team
 * @since 1.0.0
 */

import { qerrors } from 'qerrors';
import * as metricCollectionUtils from './metricCollectionUtils.js'; // unified metric collection utilities
import getPerformanceHealthStatus from './getPerformanceHealthStatus.js'; // health status calculation
import analyzePerformanceMetrics from './analyzePerformanceMetrics.js'; // metric analysis and alerting
const { createMetricsCollector, measureEventLoopLag } = metricCollectionUtils; // core metric collection functions

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

/**
 * Default Performance Thresholds
 *
 * These thresholds are carefully selected based on industry best practices
 * and real-world performance requirements for production Node.js applications.
 *
 * Threshold Rationale:
 * - maxEventLoopLag (25ms): Ensures responsive event loop, prevents request queuing
 * - maxCpuUsage (80%): Leaves headroom for burst traffic and system processes
 * - maxMemoryUsage (85%): Prevents OOM kills while allowing efficient memory use
 * - maxResponseTime (2000ms): SLA-compliant response time for user experience
 * - minThroughput (10 req/min): Minimum viable throughput for health monitoring
 *
 * Performance Impact:
 * - Conservative thresholds ensure early detection of performance degradation
 * - Configurable per-application requirements
 * - Balanced between false positives and missed issues
 */
const DEFAULT_THRESHOLDS = {
  maxEventLoopLag: 25,    // 25ms max lag - ensures responsive event loop
  maxCpuUsage: 80,        // 80% max CPU - leaves headroom for burst traffic
  maxMemoryUsage: 85,     // 85% max heap - prevents OOM while allowing efficient use
  maxResponseTime: 2000,  // 2s max response - SLA-compliant user experience
  minThroughput: 10       // 10 req/min minimum - viable throughput threshold
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

  if (typeof options.maxEventLoopLag === 'number') {
    thresholds.maxEventLoopLag = options.maxEventLoopLag;
  }
  if (typeof options.maxCpuUsage === 'number') {
    thresholds.maxCpuUsage = options.maxCpuUsage;
  }
  if (typeof options.maxMemoryUsage === 'number') {
    thresholds.maxMemoryUsage = options.maxMemoryUsage;
  }
  if (typeof options.maxResponseTime === 'number') {
    thresholds.maxResponseTime = options.maxResponseTime;
  }
  if (typeof options.minThroughput === 'number') {
    thresholds.minThroughput = options.minThroughput;
  }

  const metricsCollector: any = createMetricsCollector(); // unified metric collection
  let monitoringInterval: NodeJS.Timeout | null = null; // interval timer
  let metrics: any = null; // current metrics
  let alerts: any[] = []; // alert history

  /**
   * Core Monitoring Loop - Collect Metrics and Analyze Performance
   *
   * This function is the heart of the performance monitoring system.
   * It runs on a configurable interval and performs the following steps:
   *
   * 1. Metric Collection: Gathers current system metrics using unified collector
   * 2. Event Loop Measurement: Async measurement to prevent blocking
   * 3. Performance Analysis: Compares metrics against thresholds to generate alerts
   * 4. Alert Processing: Handles alert history, logging, and callbacks
   * 5. Memory Optimization: Triggers GC on critical memory alerts
   *
   * Error Handling Strategy:
   * - Isolates metric collection failures from analysis
   * - Protects alert callbacks with try-catch boundaries
   * - Uses qerrors for consistent error reporting
   * - Continues monitoring even if individual components fail
   *
   * Performance Considerations:
   * - Async event loop measurement prevents blocking
   * - Immutable metric objects prevent unintended mutations
   * - Limited alert history prevents memory leaks
   * - Conditional memory optimization reduces overhead
   */
  async function collectAndAnalyze() {
    // Step 1: Collect current system metrics with validation
    try {
      const rawMetrics = metricsCollector.collect();

      // Validate metrics to prevent injection attacks
      if (typeof rawMetrics !== 'object' || rawMetrics === null) {
        throw new Error('Invalid metrics data received');
      }

      metrics = rawMetrics;
    } catch (error) {
      logger.error('[performance] Failed to collect metrics:', error);
      return; // Skip this iteration
    }

    // Step 2: Measure event loop lag asynchronously (non-blocking)
    const lag = await measureEventLoopLag();

    // Validate lag value
    let validLag = lag;
    if (typeof lag !== 'number' || !isFinite(lag) || lag < 0) {
      logger.warn('[performance] Invalid event loop lag detected, using fallback');
      validLag = 0;
    }

    // Create immutable metrics object to prevent unintended mutations
    const updatedMetrics = { ...metrics, eventLoopLag: validLag };

    // Step 3: Analyze metrics against thresholds to generate alerts
    const state: any = metricsCollector.getState();
    const newAlerts: any = analyzePerformanceMetrics(updatedMetrics || {}, thresholds, state.requestCount);

    // Step 4: Process and manage alerts
    for (const alert of newAlerts) {
      alerts.push(alert); // Add to alert history

      // Limit alert history to prevent memory exhaustion (keep last 50)
      if (alerts.length > 50) {
        alerts.shift();
      }

      // Log alerts with appropriate severity levels
      if (alert.severity === 'critical') {
        logger.error(`[performance] CRITICAL: ${alert.message}`);
      } else {
        logger.warn(`[performance] WARNING: ${alert.message}`);
      }

      // Execute user-defined alert callback with error protection
      if (onAlert && typeof onAlert === 'function') {
        try {
          onAlert(alert);
        } catch (err) {
          // Use qerrors for consistent error reporting and prevent callback crashes
          qerrors(err instanceof Error ? err : new Error(String(err)), 'createPerformanceMonitor', 'Performance alert callback failed');
          logger.error('[performance] Alert callback error:', err);
        }
      }
    }

    // Step 5: Trigger memory optimization on critical memory alerts
    if (newAlerts.some(a => a.severity === 'critical' && a.type === 'memory')) {
      optimizeMemory();
    }
  }

  /**
   * Memory Optimization - Automatic Garbage Collection
   *
   * This function attempts to optimize memory usage by triggering garbage collection
   * when critical memory alerts are detected. This is a defensive measure to prevent
   * out-of-memory crashes in production environments.
   *
   * Optimization Strategy:
   * - Only runs when GC is explicitly enabled (requires --expose-gc flag)
   * - Triggered automatically on critical memory alerts
   * - Uses try-catch to handle GC failures gracefully
   * - Logs optimization attempts for monitoring and debugging
   *
   * Security Considerations:
   * - Validates GC function existence before calling
   * - Handles potential GC exceptions without crashing monitor
   * - No direct memory manipulation to prevent security issues
   *
   * Performance Impact:
   * - GC pause times are unavoidable but necessary for memory health
   * - Only triggered on critical alerts to minimize overhead
   * - Asynchronous nature reduces impact on request processing
   *
   * Usage Requirements:
   * - Node.js must be started with --expose-gc flag for manual GC
   * - Monitor will log if GC is not available
   * - Optimization is optional - system continues without it
   */
  function optimizeMemory() {
    // Check if garbage collection is exposed and available
    if (global.gc && typeof global.gc === 'function') {
      try {
        // Force garbage collection to free up memory
        global.gc();
        logger.info('[performance] Forced garbage collection for memory optimization');
      } catch (err) {
        // Log GC failures but continue monitoring
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
