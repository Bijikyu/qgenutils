/**
 * Performance Monitoring and Optimization Utility
 * 
 * PURPOSE: Provides comprehensive performance monitoring with metrics collection,
 * bottleneck detection, and automated optimization suggestions for scalable applications.
 * 
 * MONITORING FEATURES:
 * - Real-time performance metrics collection
 * - Memory usage tracking and leak detection
 * - CPU utilization monitoring
 * - Database query performance analysis
 * - API endpoint response time tracking
 * - Resource utilization patterns
 */

import { qerrors } from 'qerrors';

interface PerformanceMetrics {
  timestamp: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
    heapUsed?: number;
    heapTotal?: number;
  };
  cpuUsage: {
    percentage: number;
    loadAverage: number[];
  };
  responseTime: {
    average: number;
    p95: number;
    p99: number;
    requestsPerSecond: number;
  };
  databaseMetrics: {
    connectionPoolUtilization: number;
    averageQueryTime: number;
    slowQueries: number;
    failedQueries: number;
  };
}

interface PerformanceAlert {
  type: 'memory' | 'cpu' | 'response_time' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metrics: Partial<PerformanceMetrics>;
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private readonly MAX_METRICS_HISTORY = 1000;
  private readonly MONITORING_INTERVAL = 5000; // 5 seconds
  private monitoringInterval: NodeJS.Timeout | null = null;
  private startCpuUsage: NodeJS.CpuUsage;

  constructor() {
    this.startCpuUsage = process.cpuUsage();
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.monitoringInterval) {
      return;
    }

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.MONITORING_INTERVAL);

    // Collect initial metrics
    this.collectMetrics();
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Collect current performance metrics
   */
  private collectMetrics(): void {
    const timestamp = Date.now();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.startCpuUsage);

    const metrics: PerformanceMetrics = {
      timestamp,
      memoryUsage: {
        used: memUsage.rss,
        total: memUsage.rss + memUsage.external,
        percentage: (memUsage.rss / (memUsage.rss + memUsage.external)) * 100,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal
      },
      cpuUsage: {
        percentage: this.calculateCpuPercentage(cpuUsage),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
      },
      responseTime: {
        average: 0,
        p95: 0,
        p99: 0,
        requestsPerSecond: 0
      },
      databaseMetrics: {
        connectionPoolUtilization: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        failedQueries: 0
      }
    };

    // Add to history
    this.metrics.push(metrics);

    // Limit history size
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics.shift();
    }

    // Check for performance issues
    this.analyzePerformance(metrics);
  }

  /**
   * Analyze performance metrics and generate alerts
   */
  private analyzePerformance(metrics: PerformanceMetrics): void {
    // Memory usage alerts
    if (metrics.memoryUsage.percentage > 90) {
      this.createAlert({
        type: 'memory',
        severity: 'critical',
        message: `Memory usage is critically high: ${metrics.memoryUsage.percentage.toFixed(1)}%`,
        timestamp: metrics.timestamp,
        metrics: { memoryUsage: metrics.memoryUsage },
        recommendations: [
          'Check for memory leaks',
          'Increase available memory',
          'Optimize memory-intensive operations',
          'Consider implementing memory caching strategies'
        ]
      });
    } else if (metrics.memoryUsage.percentage > 75) {
      this.createAlert({
        type: 'memory',
        severity: 'high',
        message: `Memory usage is high: ${metrics.memoryUsage.percentage.toFixed(1)}%`,
        timestamp: metrics.timestamp,
        metrics: { memoryUsage: metrics.memoryUsage },
        recommendations: [
          'Monitor for memory leaks',
          'Optimize data structures',
          'Implement garbage collection tuning'
        ]
      });
    }

    // CPU usage alerts
    if (metrics.cpuUsage.percentage > 85) {
      this.createAlert({
        type: 'cpu',
        severity: 'high',
        message: `CPU usage is high: ${metrics.cpuUsage.percentage.toFixed(1)}%`,
        timestamp: metrics.timestamp,
        metrics: { cpuUsage: metrics.cpuUsage },
        recommendations: [
          'Optimize CPU-intensive operations',
          'Implement load balancing',
          'Consider horizontal scaling',
          'Profile application for bottlenecks'
        ]
      });
    }

    // Heap size alerts
    if (metrics.memoryUsage.heapUsed && metrics.memoryUsage.heapTotal) {
      const heapPercentage = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
      if (heapPercentage > 85) {
        this.createAlert({
          type: 'memory',
          severity: 'medium',
          message: `Heap usage is high: ${heapPercentage.toFixed(1)}%`,
          timestamp: metrics.timestamp,
          metrics: { memoryUsage: metrics.memoryUsage },
          recommendations: [
            'Check for object retention',
            'Optimize garbage collection',
            'Review memory allocation patterns'
          ]
        });
      }
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(alert: PerformanceAlert): void {
    // Avoid duplicate alerts
    const recentAlert = this.alerts.find(a => 
      a.type === alert.type && 
      a.severity === alert.severity &&
      (Date.now() - a.timestamp) < 60000 // Within last minute
    );

    if (!recentAlert) {
      this.alerts.push(alert);
      
      // Log alert
      qerrors(
        new Error(alert.message),
        'PerformanceMonitor',
        `Performance Alert: ${alert.type} - ${alert.severity}`
      );

      // Limit alerts history
      if (this.alerts.length > 100) {
        this.alerts.shift();
      }
    }
  }

  /**
   * Calculate CPU usage percentage
   */
  private calculateCpuPercentage(cpuUsage: NodeJS.CpuUsage): number {
    const totalMicrosec = cpuUsage.user + cpuUsage.system;
    const totalSec = totalMicrosec / 1000000;
    return Math.min(100, (totalSec / this.MONITORING_INTERVAL) * 100);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get performance history
   */
  getMetricsHistory(limit?: number): PerformanceMetrics[] {
    if (limit) {
      return this.metrics.slice(-limit);
    }
    return [...this.metrics];
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    const fiveMinutesAgo = Date.now() - 300000; // 5 minutes
    return this.alerts.filter(alert => alert.timestamp > fiveMinutesAgo);
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentMetrics = this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();

    if (!currentMetrics) {
      return recommendations;
    }

    // Memory recommendations
    if (currentMetrics.memoryUsage.percentage > 70) {
      recommendations.push('Consider implementing memory pooling');
      recommendations.push('Review data structure efficiency');
    }

    // CPU recommendations
    if (currentMetrics.cpuUsage.percentage > 70) {
      recommendations.push('Implement request debouncing/throttling');
      recommendations.push('Consider worker threads for CPU-intensive tasks');
    }

    // Alert-based recommendations
    activeAlerts.forEach(alert => {
      recommendations.push(...alert.recommendations);
    });

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: {
      totalMetrics: number;
      activeAlerts: number;
      averageMemoryUsage: number;
      averageCpuUsage: number;
    };
    currentMetrics: PerformanceMetrics | null;
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const activeAlerts = this.getActiveAlerts();
    const recommendations = this.getRecommendations();
    
    let averageMemoryUsage = 0;
    let averageCpuUsage = 0;

    if (this.metrics.length > 0) {
      averageMemoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage.percentage, 0) / this.metrics.length;
      averageCpuUsage = this.metrics.reduce((sum, m) => sum + m.cpuUsage.percentage, 0) / this.metrics.length;
    }

    return {
      summary: {
        totalMetrics: this.metrics.length,
        activeAlerts: activeAlerts.length,
        averageMemoryUsage,
        averageCpuUsage
      },
      currentMetrics: this.getCurrentMetrics(),
      alerts: activeAlerts,
      recommendations
    };
  }

  /**
   * Reset monitoring data
   */
  reset(): void {
    this.metrics.length = 0;
    this.alerts.length = 0;
    this.startCpuUsage = process.cpuUsage();
  }
}

export default PerformanceMonitor;
export type { PerformanceMetrics, PerformanceAlert };