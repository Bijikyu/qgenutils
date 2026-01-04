/**
 * Load Testing and Scalability Testing Utilities
 * 
 * PURPOSE: Comprehensive load testing framework for measuring application performance
 * under various stress conditions. Provides automated testing scenarios, detailed
 * metrics collection, and scalability analysis for production readiness.
 * 
 * TESTING FEATURES:
 * - Concurrent request simulation
 * - Gradual load ramp-up
 * - Stress testing with configurable limits
 * - Performance metrics collection
 * - Memory and CPU monitoring
 * - Automatic bottleneck detection
 * - Detailed reporting with recommendations
 */

import { performance } from 'perf_hooks';
import { qerrors } from 'qerrors';
import AdvancedCache from '../caching/advancedCache.js';

interface LoadTestConfig {
  name: string;
  concurrency: number; // Number of concurrent operations
  duration: number; // Test duration in milliseconds
  rampUpTime: number; // Time to ramp up to full concurrency
  requestsPerSecond?: number; // Target RPS (optional)
  payloadGenerator?: () => any; // Function to generate test data
  timeout: number; // Individual request timeout
  errorThreshold: number; // Maximum error rate percentage
}

interface LoadTestResult {
  testName: string;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  throughput: number; // Data per second
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    delta: number;
  };
  cpuUsage: {
    average: number;
    peak: number;
  };
  errors: Array<{
    type: string;
    count: number;
    samples: string[];
  }>;
  bottlenecks: string[];
  recommendations: string[];
}

class LoadTester {
  private resultsCache = new AdvancedCache<LoadTestResult>({
    maxSize: 100,
    ttl: 3600000 // 1 hour
  });

  /**
   * Execute a comprehensive load test
   */
  async runLoadTest(
    testFunction: (payload: any) => Promise<any>,
    config: LoadTestConfig
  ): Promise<LoadTestResult> {
    console.log(`🚀 Starting load test: ${config.name}`);
    console.log(`   Concurrency: ${config.concurrency}`);
    console.log(`   Duration: ${config.duration}ms`);
    
    const startTime = Date.now();
    const initialMemory = process.memoryUsage().heapUsed;
    const initialCpuUsage = process.cpuUsage();
    
    // Test execution data
    const responseTimes: number[] = [];
    const errors: Map<string, { count: number; samples: string[] }> = new Map();
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    
    // Performance monitoring
    const memoryUsage: number[] = [];
    const cpuUsage: number[] = [];
    let peakMemory = initialMemory;
    let peakCpu = 0;

    // Active request tracking
    const activeRequests = new Set<Promise<any>>();
    let currentConcurrency = 0;
    const rampUpInterval = config.rampUpTime / config.concurrency;

    // Start monitoring
    const monitoringInterval = setInterval(() => {
      const memUsage = process.memoryUsage().heapUsed;
      memoryUsage.push(memUsage);
      if (memUsage > peakMemory) peakMemory = memUsage;

      // CPU usage calculation
      const currentCpu = process.cpuUsage(initialCpuUsage);
      const cpuPercent = (currentCpu.user + currentCpu.system) / (Date.now() - startTime) * 100;
      cpuUsage.push(cpuPercent);
      if (cpuPercent > peakCpu) peakCpu = cpuPercent;
    }, 1000);

    // Load test execution
    try {
      // Ramp up phase
      for (let i = 0; i < config.concurrency; i++) {
        await this.delay(rampUpInterval);
        
        const requestPromise = this.executeRequest(
          testFunction,
          config,
          responseTimes,
          errors
        );
        
        activeRequests.add(requestPromise);
        currentConcurrency++;
        
        // Handle request completion
        requestPromise
          .then(() => {
            totalRequests++;
            successfulRequests++;
          })
          .catch(() => {
            totalRequests++;
            failedRequests++;
          })
          .finally(() => {
            activeRequests.delete(requestPromise);
            currentConcurrency--;
          });
      }

      // Maintain concurrency for duration
      const testEnd = startTime + config.duration;
      while (Date.now() < testEnd) {
        // Replace completed requests to maintain concurrency
        if (activeRequests.size < config.concurrency) {
          const newRequests = config.concurrency - activeRequests.size;
          
          for (let i = 0; i < newRequests; i++) {
            const requestPromise = this.executeRequest(
              testFunction,
              config,
              responseTimes,
              errors
            );
            
            activeRequests.add(requestPromise);
            currentConcurrency++;
            
            requestPromise
              .then(() => {
                totalRequests++;
                successfulRequests++;
              })
              .catch(() => {
                totalRequests++;
                failedRequests++;
              })
              .finally(() => {
                activeRequests.delete(requestPromise);
                currentConcurrency--;
              });
          }
        }
        
        await this.delay(100); // Check every 100ms
      }

      // Wait for all active requests to complete
      await Promise.allSettled(Array.from(activeRequests));

    } catch (error) {
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'LoadTester.runLoadTest',
        `Load test execution failed: ${config.name}`
      );
    } finally {
      clearInterval(monitoringInterval);
    }

    const endTime = Date.now();
    const finalMemory = process.memoryUsage().heapUsed;

    // Calculate metrics
    const duration = endTime - startTime;
    const errorRate = (failedRequests / totalRequests) * 100;
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Calculate percentiles
    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const p50ResponseTime = this.getPercentile(sortedTimes, 50);
    const p95ResponseTime = this.getPercentile(sortedTimes, 95);
    const p99ResponseTime = this.getPercentile(sortedTimes, 99);

    const requestsPerSecond = (totalRequests / duration) * 1000;
    const averageCpuUsage = cpuUsage.length > 0 
      ? cpuUsage.reduce((sum, cpu) => sum + cpu, 0) / cpuUsage.length 
      : 0;

    // Analyze bottlenecks and generate recommendations
    const bottlenecks = this.identifyBottlenecks({
      errorRate,
      averageResponseTime,
      p95ResponseTime,
      memoryDelta: finalMemory - initialMemory,
      cpuUsage: averageCpuUsage
    });

    const recommendations = this.generateRecommendations({
      config,
      errorRate,
      averageResponseTime,
      p95ResponseTime,
      memoryDelta: finalMemory - initialMemory,
      cpuUsage: averageCpuUsage,
      requestsPerSecond,
      bottlenecks
    });

    const result: LoadTestResult = {
      testName: config.name,
      duration,
      totalRequests,
      successfulRequests,
      failedRequests,
      errorRate,
      averageResponseTime,
      p50ResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      requestsPerSecond,
      throughput: requestsPerSecond * 1024, // Approximate
      memoryUsage: {
        initial: initialMemory,
        peak: peakMemory,
        final: finalMemory,
        delta: finalMemory - initialMemory
      },
      cpuUsage: {
        average: averageCpuUsage,
        peak: peakCpu
      },
      errors: Array.from(errors.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        samples: data.samples.slice(0, 5) // Keep only 5 samples
      })),
      bottlenecks,
      recommendations
    };

    // Cache result
    this.resultsCache.set(config.name, result);

    console.log(`✅ Load test completed: ${config.name}`);
    console.log(`   Requests: ${totalRequests} (${successfulRequests} successful, ${failedRequests} failed)`);
    console.log(`   Error rate: ${errorRate.toFixed(2)}%`);
    console.log(`   Average response time: ${averageResponseTime.toFixed(2)}ms`);
    console.log(`   Requests/sec: ${requestsPerSecond.toFixed(0)}`);

    return result;
  }

  private async executeRequest(testFunction: (payload: any) => Promise<any>, config: LoadTestConfig, responseTimes: number[], errors: Map<string, { count: number; samples: string[] }>): Promise<any> {
    const startTime = performance.now();
    try {
      const payload = config.payloadGenerator?.() ?? null;
      const result = await Promise.race([testFunction(payload), this.timeoutPromise(config.timeout)]);
      const responseTime = performance.now() - startTime;
      responseTimes.push(responseTime);
      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      responseTimes.push(responseTime);
      const errorType = error instanceof Error ? error.name : 'UnknownError';
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errors.has(errorType)) errors.set(errorType, { count: 0, samples: [] });
      const errorData = errors.get(errorType)!;
      errorData.count++;
      if (errorData.samples.length < 5) errorData.samples.push(errorMessage);
      throw error;
    }
  }

  private timeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeout));
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  private identifyBottlenecks(metrics: { errorRate: number; averageResponseTime: number; p95ResponseTime: number; memoryDelta: number; cpuUsage: number; }): string[] {
    const bottlenecks: string[] = [];
    if (metrics.errorRate > 5) bottlenecks.push('High error rate indicates system instability');
    if (metrics.averageResponseTime > 1000) bottlenecks.push('Slow response times suggest processing bottlenecks');
    if (metrics.p95ResponseTime > 2000) bottlenecks.push('95th percentile response times are too high');
    if (metrics.memoryDelta > 100 * 1024 * 1024) bottlenecks.push('Memory usage indicates potential memory leaks');
    if (metrics.cpuUsage > 80) bottlenecks.push('High CPU usage suggests compute bottlenecks');
    return bottlenecks;
  }

  /**
   * Generate performance optimization recommendations
   */
  private generateRecommendations(context: {
    config: LoadTestConfig;
    errorRate: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    memoryDelta: number;
    cpuUsage: number;
    requestsPerSecond: number;
    bottlenecks: string[];
  }): string[] {
    const recommendations: string[] = [];

    // Error rate recommendations
    if (context.errorRate > 5) {
      recommendations.push('Implement better error handling and retry logic');
      recommendations.push('Add circuit breakers to prevent cascade failures');
    }

    // Response time recommendations
    if (context.averageResponseTime > 500) {
      recommendations.push('Optimize database queries and add connection pooling');
      recommendations.push('Implement caching for frequently accessed data');
    }

    if (context.p95ResponseTime > 1500) {
      recommendations.push('Consider request timeouts and queue management');
      recommendations.push('Implement background processing for slow operations');
    }

    // Memory recommendations
    if (context.memoryDelta > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Check for memory leaks and optimize data structures');
      recommendations.push('Implement memory monitoring and automatic cleanup');
    }

    // CPU recommendations
    if (context.cpuUsage > 70) {
      recommendations.push('Optimize CPU-intensive operations');
      recommendations.push('Consider horizontal scaling or worker threads');
    }

    // Throughput recommendations
    if (context.config.requestsPerSecond && 
        context.requestsPerSecond < context.config.requestsPerSecond * 0.8) {
      recommendations.push('Increase concurrency or optimize processing pipeline');
      recommendations.push('Consider load balancing strategies');
    }

    return recommendations;
  }

  /**
   * Get cached test result
   */
  getCachedResult(testName: string): LoadTestResult | undefined {
    return this.resultsCache.get(testName);
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.resultsCache.clear();
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate load test report
   */
  generateReport(results: LoadTestResult[]): string {
    let report = '# Load Test Report\n\n';
    
    // Optimized report generation with pre-allocated array and template literals
    const reportSections: string[] = new Array(results.length);
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      // Build section efficiently using template literals
      let section = `## ${result.testName}\n\n`;
      section += `**Duration:** ${(result.duration / 1000).toFixed(1)}s\n`;
      section += `**Total Requests:** ${result.totalRequests}\n`;
      section += `**Success Rate:** ${(100 - result.errorRate).toFixed(1)}%\n`;
      section += `**Average Response Time:** ${result.averageResponseTime.toFixed(2)}ms\n`;
      section += `**95th Percentile:** ${result.p95ResponseTime.toFixed(2)}ms\n`;
      section += `**Requests/Second:** ${result.requestsPerSecond.toFixed(0)}\n`;
      section += `**Memory Usage:** ${((result.memoryUsage.delta / 1024 / 1024)).toFixed(1)}MB\n\n`;

      if (result.bottlenecks.length > 0) {
        section += `### Bottlenecks\n`;
        section += result.bottlenecks.map(bottleneck => `- ${bottleneck}`).join('\n') + '\n\n';
      }

      if (result.recommendations.length > 0) {
        section += `### Recommendations\n`;
        section += result.recommendations.map(rec => `- ${rec}`).join('\n') + '\n\n';
      }

      section += '---\n\n';
      reportSections[i] = section;
    }
    
    report += reportSections.join('');

    return report;
  }
}

export default LoadTester;
export type { LoadTestConfig, LoadTestResult };