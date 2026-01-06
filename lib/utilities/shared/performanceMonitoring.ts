/**
 * SHARED PERFORMANCE MONITORING UTILITIES
 * 
 * PURPOSE: Provides common performance monitoring and metrics collection patterns.
 * This utility eliminates duplication of CPU/memory tracking and event loop monitoring.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized metrics collection
 * - Performance-optimized monitoring
 * - Consistent measurement methods
 * - Resource usage tracking
 * - Real-time monitoring capabilities
 */

import { ErrorHandlers } from './index.js';

/**
 * CPU usage metrics interface.
 */
export interface CpuMetrics {
  user: number;
  system: number;
  total: number;
  percent: number;
}

/**
 * Memory usage metrics interface.
 */
export interface MemoryMetrics {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  heapUsedPercent: number;
  external: number;
  arrayBuffers: number;
}

/**
 * Event loop lag metrics interface.
 */
export interface EventLoopMetrics {
  lag: number;
  utilization: number;
  blocked: boolean;
}

/**
 * Throughput metrics interface.
 */
export interface ThroughputMetrics {
  count: number;
  duration: number;
  rate: number; // operations per second
  averageLatency: number;
}

/**
 * Performance monitoring options interface.
 */
export interface PerformanceMonitorOptions {
  /** Enable CPU monitoring */
  enableCpu?: boolean;
  /** Enable memory monitoring */
  enableMemory?: boolean;
  /** Enable event loop monitoring */
  enableEventLoop?: boolean;
  /** Monitoring interval in milliseconds */
  interval?: number;
  /** Maximum history size */
  maxHistory?: number;
  /** Enable automatic cleanup */
  autoCleanup?: boolean;
}

/**
 * Collected performance metrics interface.
 */
export interface CollectedMetrics {
  timestamp: number;
  cpu?: CpuMetrics | null;
  memory?: MemoryMetrics | null;
  eventLoop?: EventLoopMetrics | null;
  throughput?: ThroughputMetrics | null;
}

/**
 * Creates a performance metrics collector.
 * 
 * @param options - Monitoring configuration options
 * @returns Performance collector with standardized methods
 */
export const createMetricsCollector = (options: PerformanceMonitorOptions = {}) => {
  const {
    enableCpu = true,
    enableMemory = true,
    enableEventLoop = true,
    interval = 1000,
    maxHistory = 100,
    autoCleanup = true
  } = options;

  let monitoringInterval: NodeJS.Timeout | null = null;
  let lastCpuUsage: NodeJS.CpuUsage | null = null;
  let history: CollectedMetrics[] = [];
  let throughputCounter = 0;
  let throughputStart = Date.now();

  /**
   * Collects current CPU usage.
   */
  const collectCpuUsage = (): CpuMetrics | null => {
    if (!enableCpu) return null;

    try {
      const currentUsage = process.cpuUsage(lastCpuUsage || undefined);
      const total = currentUsage.user + currentUsage.system;
      const percent = Math.min(100, (total / (interval * 1000)) * 100);

      lastCpuUsage = process.cpuUsage();

      return {
        user: currentUsage.user,
        system: currentUsage.system,
        total,
        percent
      };
    } catch (error) {
      ErrorHandlers.handleError(error, {
        functionName: 'collectCpuUsage',
        context: 'Performance metrics collection'
      });
      return null;
    }
  };

  /**
   * Collects current memory usage.
   */
  const collectMemoryUsage = (): MemoryMetrics | null => {
    if (!enableMemory) return null;

    try {
      const usage = process.memoryUsage();
      const heapUsedPercent = usage.heapTotal > 0 ? (usage.heapUsed / usage.heapTotal) * 100 : 0;

      return {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        heapUsedPercent,
        external: usage.external,
        arrayBuffers: usage.arrayBuffers
      };
    } catch (error) {
      ErrorHandlers.handleError(error, {
        functionName: 'collectMemoryUsage',
        context: 'Performance metrics collection'
      });
      return null;
    }
  };

  /**
   * Measures event loop lag.
   */
  const measureEventLoopLag = (): Promise<EventLoopMetrics> => {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000;
        const utilization = Math.min(100, (lag / interval) * 100);
        const blocked = lag > interval * 2;

        resolve({
          lag,
          utilization,
          blocked
        });
      });
    });
  };

  /**
   * Collects throughput metrics.
   */
  const collectThroughput = (): ThroughputMetrics | null => {
    const now = Date.now();
    const duration = now - throughputStart;
    
    if (throughputCounter === 0) return null;

    const rate = (throughputCounter / duration) * 1000;
    const averageLatency = duration / throughputCounter;

    return {
      count: throughputCounter,
      duration,
      rate,
      averageLatency
    };
  };

  /**
   * Collects all enabled metrics.
   */
  const collectMetrics = async (): Promise<CollectedMetrics> => {
    const timestamp = Date.now();
    const metrics: CollectedMetrics = { timestamp };

    // Collect synchronous metrics
    metrics.cpu = collectCpuUsage();
    metrics.memory = collectMemoryUsage();
    metrics.throughput = collectThroughput();

    // Collect async metrics
    if (enableEventLoop) {
      metrics.eventLoop = await measureEventLoopLag();
    }

    return metrics;
  };

  /**
   * Starts continuous monitoring.
   */
  const startMonitoring = () => {
    if (monitoringInterval) return;

    monitoringInterval = setInterval(async () => {
      try {
        const metrics = await collectMetrics();
        
        // Add to history
        history.push(metrics);
        
        // Limit history size
        if (history.length > maxHistory) {
          history = history.slice(-maxHistory);
        }
      } catch (error) {
        ErrorHandlers.handleError(error, {
          functionName: 'startMonitoring',
          context: 'Continuous performance monitoring'
        });
      }
    }, interval);
  };

  /**
   * Stops continuous monitoring.
   */
  const stopMonitoring = () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  };

  /**
   * Records an operation for throughput tracking.
   */
  const recordOperation = () => {
    throughputCounter++;
  };

  /**
   * Resets throughput counter.
   */
  const resetThroughput = () => {
    throughputCounter = 0;
    throughputStart = Date.now();
  };

  /**
   * Gets current metrics snapshot.
   */
  const getCurrentMetrics = async () => {
    return await collectMetrics();
  };

  /**
   * Gets metrics history.
   */
  const getHistory = (count?: number) => {
    return count ? history.slice(-count) : [...history];
  };

  /**
   * Gets average metrics over time window.
   */
  const getAverageMetrics = (duration: number): CollectedMetrics | null => {
    const now = Date.now();
    const recentHistory = history.filter(m => (now - m.timestamp) <= duration);
    
    if (recentHistory.length === 0) return null;

    const average: CollectedMetrics = {
      timestamp: now,
      cpu: recentHistory.length > 0 && recentHistory.some(m => m.cpu !== undefined) ? {
        user: 0,
        system: 0,
        total: 0,
        percent: recentHistory.reduce((sum, m) => sum + (m.cpu?.percent || 0), 0) / recentHistory.length
      } : undefined,
      memory: recentHistory.length > 0 && recentHistory.some(m => m.memory !== undefined) ? {
        rss: recentHistory.reduce((sum, m) => sum + (m.memory?.rss || 0), 0) / recentHistory.length,
        heapTotal: recentHistory.reduce((sum, m) => sum + (m.memory?.heapTotal || 0), 0) / recentHistory.length,
        heapUsed: recentHistory.reduce((sum, m) => sum + (m.memory?.heapUsed || 0), 0) / recentHistory.length,
        heapUsedPercent: recentHistory.reduce((sum, m) => sum + (m.memory?.heapUsedPercent || 0), 0) / recentHistory.length,
        external: recentHistory.reduce((sum, m) => sum + (m.memory?.external || 0), 0) / recentHistory.length,
        arrayBuffers: recentHistory.reduce((sum, m) => sum + (m.memory?.arrayBuffers || 0), 0) / recentHistory.length
      } : undefined,
      eventLoop: recentHistory.length > 0 && recentHistory.some(m => m.eventLoop !== undefined) ? {
        lag: recentHistory.reduce((sum, m) => sum + (m.eventLoop?.lag || 0), 0) / recentHistory.length,
        utilization: recentHistory.reduce((sum, m) => sum + (m.eventLoop?.utilization || 0), 0) / recentHistory.length,
        blocked: recentHistory.some(m => m.eventLoop?.blocked)
      } : undefined,
      throughput: recentHistory.length > 0 && recentHistory.some(m => m.throughput !== undefined) ? {
        count: recentHistory.reduce((sum, m) => sum + (m.throughput?.count || 0), 0),
        duration: recentHistory.reduce((sum, m) => sum + (m.throughput?.duration || 0), 0),
        rate: recentHistory.reduce((sum, m) => sum + (m.throughput?.rate || 0), 0) / recentHistory.length,
        averageLatency: recentHistory.reduce((sum, m) => sum + (m.throughput?.averageLatency || 0), 0) / recentHistory.length
      } : undefined
    };

    return average;
  };

  /**
   * Gets performance health status.
   */
  const getHealthStatus = () => {
    const recent = getHistory(10);
    if (recent.length === 0) return 'unknown';

    const avgCpu = recent.reduce((sum, m) => sum + (m.cpu?.percent || 0), 0) / recent.length;
    const avgMemPercent = recent.reduce((sum, m) => sum + (m.memory?.heapUsedPercent || 0), 0) / recent.length;
    const maxLag = Math.max(...recent.map(m => m.eventLoop?.lag || 0));

    if (avgCpu > 80 || avgMemPercent > 90 || maxLag > 100) return 'critical';
    if (avgCpu > 60 || avgMemPercent > 75 || maxLag > 50) return 'warning';
    return 'healthy';
  };

  /**
   * Cleanup function.
   */
  const cleanup = () => {
    stopMonitoring();
    history = [];
    lastCpuUsage = null;
  };

  // Auto-cleanup on process exit
  if (autoCleanup) {
    process.on('exit', cleanup);
  }

  return {
    startMonitoring,
    stopMonitoring,
    getCurrentMetrics,
    getHistory,
    getAverageMetrics,
    getHealthStatus,
    recordOperation,
    resetThroughput,
    cleanup
  };
};

/**
 * Creates a simple performance tracker for function execution.
 */
export const createPerformanceTracker = () => {
  const timers = new Map<string, number>();

  const start = (id: string) => {
    timers.set(id, Date.now());
  };

  const end = (id: string): number => {
    const startTime = timers.get(id);
    if (startTime === undefined) return 0;

    const duration = Date.now() - startTime;
    timers.delete(id);
    return duration;
  };

  const time = <T>(id: string, fn: () => T): { result: T; duration: number } => {
    const startTime = Date.now();
    const result = fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  };

  const timeAsync = async <T>(id: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  };

  const cleanup = () => {
    timers.clear();
  };

  return { start, end, time, timeAsync, cleanup };
};

// Export performance monitoring utilities
export const PerformanceMonitoring = {
  createMetricsCollector,
  createPerformanceTracker
};

export default PerformanceMonitoring;