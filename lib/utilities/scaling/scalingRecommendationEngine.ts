/**
 * Automatic Scaling Recommendations Engine
 * 
 * PURPOSE: Intelligent analysis system that provides automated scaling recommendations
 * based on current performance metrics, resource utilization patterns, and predictive
 * algorithms. Helps maintain optimal performance under varying load conditions.
 * 
 * SCALING FEATURES:
 * - Real-time performance analysis
 * - Predictive scaling recommendations
 * - Cost optimization suggestions
 * - Multi-dimensional resource analysis
 * - Automated threshold management
 * - Scaling policy recommendations
 */

import { qerrors } from 'qerrors';

interface ResourceMetrics {
  cpu: {
    current: number;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  memory: {
    current: number;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    pressure: number; // 0-100 scale
  };
  network: {
    throughput: number;
    latency: number;
    connections: number;
    errorRate: number;
  };
  disk: {
    usage: number;
    iops: number;
    latency: number;
  };
  application: {
    responseTime: number;
    errorRate: number;
    throughput: number;
    queueDepth: number;
  };
}

interface ScalingThresholds {
  cpu: {
    scaleUp: number;
    scaleDown: number;
    critical: number;
  };
  memory: {
    scaleUp: number;
    scaleDown: number;
    critical: number;
  };
  responseTime: {
    scaleUp: number;
    critical: number;
  };
  errorRate: {
    scaleUp: number;
    critical: number;
  };
  queueDepth: {
    scaleUp: number;
    critical: number;
  };
}

interface ScalingRecommendation {
  type: 'scale_up' | 'scale_down' | 'optimize' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  resource: string;
  currentValue: number;
  threshold: number;
  action: string;
  reason: string;
  estimatedImpact: string;
  costImpact: 'low' | 'medium' | 'high';
  implementationComplexity: 'simple' | 'moderate' | 'complex';
}

interface ScalingPolicy {
  name: string;
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  scaleUpIncrement: number;
  scaleDownIncrement: number;
}

class ScalingRecommendationEngine {
  private metrics: ResourceMetrics[] = [];
  private thresholds: ScalingThresholds;
  private historySize = 60; // Keep 60 data points
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor(customThresholds?: Partial<ScalingThresholds>) {
    this.thresholds = {
      cpu: {
        scaleUp: 70,
        scaleDown: 30,
        critical: 90
      },
      memory: {
        scaleUp: 75,
        scaleDown: 35,
        critical: 95
      },
      responseTime: {
        scaleUp: 500, // ms
        critical: 1000 // ms
      },
      errorRate: {
        scaleUp: 5, // %
        critical: 10 // %
      },
      queueDepth: {
        scaleUp: 50,
        critical: 100
      },
      ...customThresholds
    };
  }

  /**
   * Start continuous monitoring and analysis
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.analysisInterval) {
      return;
    }

    this.analysisInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzeScalingNeeds();
    }, intervalMs);

    // Initial collection
    this.collectMetrics();
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  /**
   * Collect current resource metrics
   */
  private collectMetrics(): void {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics: ResourceMetrics = {
      cpu: {
        current: this.calculateCpuUsage(cpuUsage),
        average: this.calculateAverageCpu(),
        peak: this.calculatePeakCpu(),
        trend: this.calculateCpuTrend()
      },
      memory: {
        current: (memUsage.heapUsed / memUsage.heapTotal) * 100,
        average: this.calculateAverageMemory(),
        peak: this.calculatePeakMemory(),
        trend: this.calculateMemoryTrend(),
        pressure: this.calculateMemoryPressure()
      },
      network: {
        throughput: 0, // Would need network monitoring
        latency: 0, // Would need network monitoring
        connections: 0, // Would need network monitoring
        errorRate: 0 // Would need network monitoring
      },
      disk: {
        usage: 0, // Would need disk monitoring
        iops: 0, // Would need disk monitoring
        latency: 0 // Would need disk monitoring
      },
      application: {
        responseTime: 0, // Would need application monitoring
        errorRate: 0, // Would need application monitoring
        throughput: 0, // Would need application monitoring
        queueDepth: 0 // Would need application monitoring
      }
    };

    this.metrics.push(metrics);
    if (this.metrics.length > this.historySize) {
      this.metrics.shift();
    }
  }

  /**
   * Analyze current metrics and generate scaling recommendations
   */
  analyzeScalingNeeds(): ScalingRecommendation[] {
    if (this.metrics.length === 0) {
      return [];
    }

    const current = this.metrics[this.metrics.length - 1];
    const recommendations: ScalingRecommendation[] = [];

    // CPU-based recommendations
    recommendations.push(...this.analyzeCpuScaling(current));
    
    // Memory-based recommendations
    recommendations.push(...this.analyzeMemoryScaling(current));
    
    // Response time-based recommendations
    recommendations.push(...this.analyzeResponseTimeScaling(current));
    
    // Error rate-based recommendations
    recommendations.push(...this.analyzeErrorRateScaling(current));
    
    // Queue depth-based recommendations
    recommendations.push(...this.analyzeQueueDepthScaling(current));

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Analyze CPU utilization and generate recommendations
   */
  private analyzeCpuScaling(current: ResourceMetrics): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];

    if (current.cpu.current >= this.thresholds.cpu.critical) {
      recommendations.push({
        type: 'scale_up',
        priority: 'critical',
        resource: 'cpu',
        currentValue: current.cpu.current,
        threshold: this.thresholds.cpu.critical,
        action: 'Immediate scale-up required',
        reason: 'CPU usage is at critical levels, performance severely degraded',
        estimatedImpact: 'High - immediate performance improvement',
        costImpact: 'high',
        implementationComplexity: 'simple'
      });
    } else if (current.cpu.current >= this.thresholds.cpu.scaleUp) {
      recommendations.push({
        type: 'scale_up',
        priority: 'high',
        resource: 'cpu',
        currentValue: current.cpu.current,
        threshold: this.thresholds.cpu.scaleUp,
        action: 'Scale up resources',
        reason: 'CPU usage is consistently high, approaching performance limits',
        estimatedImpact: 'High - significant performance improvement',
        costImpact: 'medium',
        implementationComplexity: 'simple'
      });
    } else if (current.cpu.current <= this.thresholds.cpu.scaleDown && current.cpu.trend === 'decreasing') {
      recommendations.push({
        type: 'scale_down',
        priority: 'medium',
        resource: 'cpu',
        currentValue: current.cpu.current,
        threshold: this.thresholds.cpu.scaleDown,
        action: 'Consider scaling down',
        reason: 'CPU usage is low with decreasing trend, opportunity for cost optimization',
        estimatedImpact: 'Low - cost savings',
        costImpact: 'low', // Cost reduction
        implementationComplexity: 'simple'
      });
    }

    return recommendations;
  }

  /**
   * Analyze memory usage and generate recommendations
   */
  private analyzeMemoryScaling(current: ResourceMetrics): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];

    if (current.memory.current >= this.thresholds.memory.critical) {
      recommendations.push({
        type: 'critical',
        priority: 'critical',
        resource: 'memory',
        currentValue: current.memory.current,
        threshold: this.thresholds.memory.critical,
        action: 'Immediate memory optimization required',
        reason: 'Memory usage at critical levels, risk of out-of-memory errors',
        estimatedImpact: 'Critical - prevents system crashes',
        costImpact: 'medium',
        implementationComplexity: 'moderate'
      });
    } else if (current.memory.current >= this.thresholds.memory.scaleUp) {
      recommendations.push({
        type: 'scale_up',
        priority: 'high',
        resource: 'memory',
        currentValue: current.memory.current,
        threshold: this.thresholds.memory.scaleUp,
        action: 'Increase memory allocation',
        reason: 'Memory usage is high, potential performance degradation',
        estimatedImpact: 'High - prevents memory-related issues',
        costImpact: 'medium',
        implementationComplexity: 'simple'
      });
    }

    return recommendations;
  }

  /**
   * Analyze response times and generate recommendations
   */
  private analyzeResponseTimeScaling(current: ResourceMetrics): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];

    if (current.application.responseTime >= this.thresholds.responseTime.critical) {
      recommendations.push({
        type: 'critical',
        priority: 'critical',
        resource: 'response_time',
        currentValue: current.application.responseTime,
        threshold: this.thresholds.responseTime.critical,
        action: 'Immediate performance optimization required',
        reason: 'Response times are critically slow, user experience severely impacted',
        estimatedImpact: 'Critical - restores acceptable performance',
        costImpact: 'high',
        implementationComplexity: 'complex'
      });
    } else if (current.application.responseTime >= this.thresholds.responseTime.scaleUp) {
      recommendations.push({
        type: 'optimize',
        priority: 'high',
        resource: 'response_time',
        currentValue: current.application.responseTime,
        threshold: this.thresholds.responseTime.scaleUp,
        action: 'Optimize application performance',
        reason: 'Response times are slower than target, impacting user experience',
        estimatedImpact: 'High - improves user satisfaction',
        costImpact: 'medium',
        implementationComplexity: 'moderate'
      });
    }

    return recommendations;
  }

  /**
   * Analyze error rates and generate recommendations
   */
  private analyzeErrorRateScaling(current: ResourceMetrics): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];

    if (current.application.errorRate >= this.thresholds.errorRate.critical) {
      recommendations.push({
        type: 'critical',
        priority: 'critical',
        resource: 'error_rate',
        currentValue: current.application.errorRate,
        threshold: this.thresholds.errorRate.critical,
        action: 'Immediate error investigation required',
        reason: 'Error rate is critically high, system stability at risk',
        estimatedImpact: 'Critical - restores system reliability',
        costImpact: 'high',
        implementationComplexity: 'complex'
      });
    } else if (current.application.errorRate >= this.thresholds.errorRate.scaleUp) {
      recommendations.push({
        type: 'scale_up',
        priority: 'high',
        resource: 'error_rate',
        currentValue: current.application.errorRate,
        threshold: this.thresholds.errorRate.scaleUp,
        action: 'Increase resources and investigate errors',
        reason: 'Elevated error rate suggests system overload or issues',
        estimatedImpact: 'High - improves reliability',
        costImpact: 'medium',
        implementationComplexity: 'moderate'
      });
    }

    return recommendations;
  }

  /**
   * Analyze queue depth and generate recommendations
   */
  private analyzeQueueDepthScaling(current: ResourceMetrics): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];

    if (current.application.queueDepth >= this.thresholds.queueDepth.critical) {
      recommendations.push({
        type: 'critical',
        priority: 'critical',
        resource: 'queue_depth',
        currentValue: current.application.queueDepth,
        threshold: this.thresholds.queueDepth.critical,
        action: 'Immediate scale-up or queue processing',
        reason: 'Queue depth is critically high, risk of request loss',
        estimatedImpact: 'Critical - prevents request loss',
        costImpact: 'high',
        implementationComplexity: 'simple'
      });
    } else if (current.application.queueDepth >= this.thresholds.queueDepth.scaleUp) {
      recommendations.push({
        type: 'scale_up',
        priority: 'high',
        resource: 'queue_depth',
        currentValue: current.application.queueDepth,
        threshold: this.thresholds.queueDepth.scaleUp,
        action: 'Scale up processing capacity',
        reason: 'Queue depth is growing, processing capacity insufficient',
        estimatedImpact: 'High - improves throughput',
        costImpact: 'medium',
        implementationComplexity: 'simple'
      });
    }

    return recommendations;
  }

  /**
   * Generate optimal scaling policy
   */
  generateScalingPolicy(recommendations: ScalingRecommendation[]): ScalingPolicy {
    const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
    const highCount = recommendations.filter(r => r.priority === 'high').length;

    return {
      name: 'Auto-generated Policy',
      minInstances: criticalCount > 0 ? 2 : 1,
      maxInstances: highCount > 2 ? 10 : 5,
      targetCpuUtilization: this.thresholds.cpu.scaleUp - 10,
      targetMemoryUtilization: this.thresholds.memory.scaleUp - 10,
      scaleUpCooldown: 300000, // 5 minutes
      scaleDownCooldown: 600000, // 10 minutes
      scaleUpIncrement: criticalCount > 0 ? 2 : 1,
      scaleDownIncrement: 1
    };
  }

  /**
   * Calculate current CPU usage percentage
   */
  private calculateCpuUsage(cpuUsage: NodeJS.CpuUsage): number {
    // Simplified CPU calculation
    return Math.min(100, (cpuUsage.user + cpuUsage.system) / 1000000);
  }

  /**
   * Calculate average CPU usage from history
   */
  private calculateAverageCpu(): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((sum, m) => sum + m.cpu.current, 0) / this.metrics.length;
  }

  /**
   * Calculate peak CPU usage from history
   */
  private calculatePeakCpu(): number {
    if (this.metrics.length === 0) return 0;
    return Math.max(...this.metrics.map(m => m.cpu.current));
  }

  /**
   * Calculate CPU trend
   */
  private calculateCpuTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.metrics.length < 3) return 'stable';
    
    const recent = this.metrics.slice(-3).map(m => m.cpu.current);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const threshold = 5; // 5% threshold

    if (last - first > threshold) return 'increasing';
    if (first - last > threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate average memory usage from history
   */
  private calculateAverageMemory(): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((sum, m) => sum + m.memory.current, 0) / this.metrics.length;
  }

  /**
   * Calculate peak memory usage from history
   */
  private calculatePeakMemory(): number {
    if (this.metrics.length === 0) return 0;
    return Math.max(...this.metrics.map(m => m.memory.current));
  }

  /**
   * Calculate memory trend
   */
  private calculateMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.metrics.length < 3) return 'stable';
    
    const recent = this.metrics.slice(-3).map(m => m.memory.current);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const threshold = 5; // 5% threshold

    if (last - first > threshold) return 'increasing';
    if (first - last > threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate memory pressure score
   */
  private calculateMemoryPressure(): number {
    if (this.metrics.length === 0) return 0;
    
    const current = this.metrics[this.metrics.length - 1].memory.current;
    const peak = this.calculatePeakMemory();
    const average = this.calculateAverageMemory();
    
    // Pressure based on current vs average and trend to peak
    const pressureFromAverage = Math.min(100, (current / average) * 50);
    const pressureFromPeak = Math.min(100, (current / peak) * 50);
    
    return Math.min(100, pressureFromAverage + pressureFromPeak);
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): ResourceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): ResourceMetrics[] {
    return [...this.metrics];
  }
}

export default ScalingRecommendationEngine;
export type { ResourceMetrics, ScalingRecommendation, ScalingPolicy, ScalingThresholds };