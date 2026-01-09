/**
 * Common Performance and Monitoring Utilities
 *
 * Centralized performance utilities to eliminate code duplication across
 * codebase. These utilities handle common performance patterns including
 * metrics collection, timing, request tracking, and monitoring.
 */

import { Request } from 'express';
import { loadavg } from 'os';
import { handleError } from '../error/commonErrorHandling.js';

/**
 * Performance timer for measuring execution time
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;

  /**
   * Starts the timer
   */
  start(): void {
    this.startTime = Date.now();
    this.endTime = 0;
  }

  /**
   * Stops the timer
   */
  stop(): number {
    this.endTime = Date.now();
    return this.getDuration();
  }

  /**
   * Gets the current duration (doesn't stop timer)
   */
  getDuration(): number {
    if (this.startTime === 0) {
      return 0;
    }

    const currentTime = this.endTime > 0 ? this.endTime : Date.now();
    return currentTime - this.startTime;
  }

  /**
   * Resets the timer
   */
  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
  }

  /**
   * Returns timer status
   */
  isRunning(): boolean {
    return this.startTime > 0 && this.endTime === 0;
  }

  /**
   * Returns formatted duration string
   */
  getFormattedDuration(): string {
    const duration = this.getDuration();

    if (duration < 1000) {
      return `${duration}ms`;
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(2)}s`;
    } else {
      return `${(duration / 60000).toFixed(2)}m`;
    }
  }
}

/**
 * Request metrics interface
 */
interface RequestMetrics {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
  error?: string;
}

/**
 * Request tracker for monitoring
 */
export class RequestTracker {
  private requests = new Map<string, RequestMetrics>();

  /**
   * Generates unique request ID
   */
  generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req_${timestamp}_${random}`;
  }

  /**
   * Starts tracking a request
   */
  startRequest(req: Request): string {
    const requestId = this.generateRequestId();

    const metrics: RequestMetrics = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      startTime: Date.now()
    };

    this.requests.set(requestId, metrics);

    // Attach request ID to request object
    (req as any).requestId = requestId;

    return requestId;
  }

  /**
   * Ends tracking a request
   */
  endRequest(req: Request, statusCode: number, responseSize?: number, error?: string): RequestMetrics | null {
    const requestId = (req as any).requestId;

    if (!requestId) {
      return null;
    }

    const metrics = this.requests.get(requestId);

    if (!metrics) {
      return null;
    }

    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.statusCode = statusCode;
    metrics.responseSize = responseSize;
    metrics.error = error;

    // Remove from active requests
    this.requests.delete(requestId);

    return metrics;
  }

  /**
   * Gets active request count
   */
  getActiveRequestCount(): number {
    return this.requests.size;
  }

  /**
   * Gets active requests
   */
  getActiveRequests(): RequestMetrics[] {
    return Array.from(this.requests.values());
  }

  /**
   * Cleans up old requests (prevent memory leaks)
   */
  cleanup(maxAgeMs: number = 300000): void { // 5 minutes default
    const cutoffTime = Date.now() - maxAgeMs;

    for (const [requestId, metrics] of this.requests.entries()) {
      if (metrics.startTime < cutoffTime) {
        this.requests.delete(requestId);
      }
    }
  }
}

/**
 * System metrics interface
 */
interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    free: number;
    percentage: number;
  };
  uptime: number;
  timestamp: number;
}

/**
 * System metrics collector
 */
export class SystemMetricsCollector {
  private lastCpuUsage: NodeJS.CpuUsage;
  private lastCpuTime: number;

  constructor() {
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = Date.now();
  }

  /**
   * Collects current system metrics
   */
  collectMetrics(): SystemMetrics {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage(this.lastCpuUsage);
      const currentTime = Date.now();
      const timeDelta = currentTime - this.lastCpuTime;

      // Calculate CPU usage percentage
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / (timeDelta * 1000) * 100;

      const metrics: SystemMetrics = {
        cpu: {
          usage: Math.min(cpuPercent, 100), // Cap at 100%
          loadAverage: loadavg()
        },
        memory: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal,
          free: memUsage.heapTotal - memUsage.heapUsed,
          percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
        },
        uptime: process.uptime(),
        timestamp: currentTime
      };

      // Update last values
      this.lastCpuUsage = process.cpuUsage();
      this.lastCpuTime = currentTime;

      return metrics;
    } catch (error) {
      handleError(error, 'collectMetrics', 'System metrics collection failed');

      // Return fallback metrics
      return {
        cpu: { usage: 0, loadAverage: [0, 0, 0] },
        memory: { used: 0, total: 0, free: 0, percentage: 0 },
        uptime: process.uptime(),
        timestamp: Date.now()
      };
    }
  }

  /**
   * Gets memory usage in human readable format
   */
  getMemoryUsageString(): string {
    const memUsage = process.memoryUsage();
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    return `${usedMB}MB / ${totalMB}MB`;
  }
}

/**
 * Performance monitoring manager
 */
export class PerformanceMonitor {
  private requestTracker = new RequestTracker();
  private metricsCollector = new SystemMetricsCollector();
  private metrics: SystemMetrics[] = [];
  private maxMetricsHistory = 100;

  /**
   * Creates request middleware
   */
  createRequestMiddleware() {
    return (req: any, res: any, next: Function): void => {
      // Start tracking
      this.requestTracker.startRequest(req);

      // Capture response end
      const originalEnd = res.end;
      res.end = function(this: any, ...args: any[]) {
        const metrics = this.requestTracker.endRequest(req, res.statusCode, res.get('Content-Length'));

        if (metrics) {
          // Log slow requests
          if (metrics.duration && metrics.duration > 5000) { // 5 seconds
            console.warn(`Slow request detected: ${req.method} ${req.url} took ${metrics.duration}ms`);
          }
        }

        originalEnd.apply(this, args);
      }.bind({ requestTracker: this.requestTracker });

      next();
    };
  }

  /**
   * Collects and stores system metrics
   */
  collectMetrics(): SystemMetrics {
    const metrics = this.metricsCollector.collectMetrics();

    // Add to history
    this.metrics.push(metrics);

    // Limit history size
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    return metrics;
  }

  /**
   * Gets current system metrics
   */
  getCurrentMetrics(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Gets metrics history
   */
  getMetricsHistory(): SystemMetrics[] {
    return [...this.metrics];
  }

  /**
   * Gets performance summary
   */
  getPerformanceSummary(): {
    averageCpuUsage: number;
    averageMemoryUsage: number;
    peakMemoryUsage: number;
    activeRequests: number;
    } {
    if (this.metrics.length === 0) {
      return {
        averageCpuUsage: 0,
        averageMemoryUsage: 0,
        peakMemoryUsage: 0,
        activeRequests: 0
      };
    }

    const totalCpu = this.metrics.reduce((sum, m) => sum + m.cpu.usage, 0);
    const totalMemory = this.metrics.reduce((sum, m) => sum + m.memory.percentage, 0);
    const peakMemory = Math.max(...this.metrics.map(m => m.memory.percentage));

    return {
      averageCpuUsage: totalCpu / this.metrics.length,
      averageMemoryUsage: totalMemory / this.metrics.length,
      peakMemoryUsage: peakMemory,
      activeRequests: this.requestTracker.getActiveRequestCount()
    };
  }

  /**
   * Starts periodic metrics collection
   */
  startPeriodicCollection(intervalMs: number = 30000): void { // 30 seconds default
    setInterval(() => {
      this.collectMetrics();

      // Cleanup old requests
      this.requestTracker.cleanup();
    }, intervalMs);
  }
}

/**
 * Performance benchmarking utility
 */
export class PerformanceBenchmark {
  private results: Array<{
    name: string;
    duration: number;
    iterations: number;
    averageDuration: number;
  }> = [];

  /**
   * Benchmarks a function
   */
  async benchmark(
    name: string,
    fn: () => Promise<void> | void,
    iterations: number = 1000
  ): Promise<void> {
    const timer = new PerformanceTimer();
    timer.start();

    // Run iterations
    for (let i = 0; i < iterations; i++) {
      await fn();
    }

    const totalDuration = timer.stop();
    const averageDuration = totalDuration / iterations;

    this.results.push({
      name,
      duration: totalDuration,
      iterations,
      averageDuration
    });

    console.log(`Benchmark: ${name} - ${iterations} iterations in ${totalDuration}ms (avg: ${averageDuration.toFixed(2)}ms)`);
  }

  /**
   * Gets benchmark results
   */
  getResults(): typeof this.results {
    return [...this.results];
  }

  /**
   * Clears benchmark results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Compares benchmark results
   */
  compareResults(): string {
    if (this.results.length < 2) {
      return 'Need at least 2 benchmarks to compare';
    }

    const sorted = [...this.results].sort((a, b) => a.averageDuration - b.averageDuration);
    const fastest = sorted[0];
    const slowest = sorted[sorted.length - 1];
    const speedup = (slowest.averageDuration / fastest.averageDuration).toFixed(2);

    return `Fastest: ${fastest.name} (${fastest.averageDuration.toFixed(2)}ms), Slowest: ${slowest.name} (${slowest.averageDuration.toFixed(2)}ms), Speedup: ${speedup}x`;
  }
}

/**
 * Global performance monitor instance
 */
const globalPerformanceMonitor = new PerformanceMonitor();

/**
 * Gets the global performance monitor
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  return globalPerformanceMonitor;
}

/**
 * Creates a performance timer with automatic logging
 */
export function createTimer(name: string): PerformanceTimer {
  const timer = new PerformanceTimer();
  timer.start();

  // Add automatic logging on garbage collection
  const originalStop = timer.stop.bind(timer);
  timer.stop = function(): number {
    const duration = originalStop();
    console.log(`Timer '${name}': ${timer.getFormattedDuration()}`);
    return duration;
  };

  return timer;
}

/**
 * Measures function execution time
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<{ result: T; duration: number }> {
  const timer = new PerformanceTimer();
  timer.start();

  try {
    const result = await fn();
    const duration = timer.stop();

    console.log(`Function '${name}' executed in ${timer.getFormattedDuration()}`);

    return { result, duration };
  } catch (error) {
    const duration = timer.stop();
    console.log(`Function '${name}' failed after ${timer.getFormattedDuration()}`);
    throw error;
  }
}

/**
 * Memory usage monitoring
 */
export function checkMemoryUsage(threshold: number = 90): boolean {
  const memUsage = process.memoryUsage();
  const memoryPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  if (memoryPercentage > threshold) {
    console.warn(`High memory usage detected: ${memoryPercentage.toFixed(2)}%`);
    return true;
  }

  return false;
}

/**
 * CPU usage monitoring
 */
export function checkCpuUsage(threshold: number = 80): boolean {
  const collector = new SystemMetricsCollector();
  const metrics = collector.collectMetrics();

  if (metrics.cpu.usage > threshold) {
    console.warn(`High CPU usage detected: ${metrics.cpu.usage.toFixed(2)}%`);
    return true;
  }

  return false;
}
