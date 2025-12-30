/**
 * Health Check Endpoints Implementation
 * 
 * PURPOSE: Comprehensive health monitoring system providing detailed
 * application health status, dependency checks, and readiness
 * probes for production deployments.
 * 
 * HEALTH CHECK FEATURES:
 * - Multiple health check levels (liveness, readiness, detailed)
 * - Dependency health monitoring
 * - Performance thresholds monitoring
 * - Custom health check registration
 * - Health degradation detection
 * - Comprehensive health reporting
 */

import { Request, Response } from 'express';
import { qerrors } from 'qerrors';

interface HealthCheck {
  name: string;
  check: () => Promise<boolean> | boolean;
  timeout?: number;
  critical?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  message?: string;
  details?: any;
  tags?: string[];
  timestamp: number;
}

interface HealthResponse {
  status: 'pass' | 'fail' | 'warn';
  timestamp: string;
  duration: number;
  version?: string;
  releaseId?: string;
  checks: Record<string, HealthCheckResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warned: number;
    critical: number;
  };
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
  };
}

interface HealthThresholds {
  memoryUsage?: number;      // Maximum memory usage percentage
  cpuUsage?: number;        // Maximum CPU usage percentage
  responseTime?: number;     // Maximum response time in milliseconds
  errorRate?: number;       // Maximum error rate percentage
  uptime?: number;          // Minimum uptime in seconds
}

interface HealthConfig {
  name: string;
  version?: string;
  releaseId?: string;
  thresholds?: HealthThresholds;
  enableSystemChecks?: boolean;
  timeout?: number;
  detailed?: boolean;
  tags?: string[];
}

class HealthChecker {
  private config: Required<HealthConfig>;
  private checks: Map<string, HealthCheck> = new Map();
  private lastResults: Map<string, HealthCheckResult> = new Map();
  private startTime: number;

  constructor(config: HealthConfig) {
    this.config = {
      name: config.name,
      version: config.version || '1.0.0',
      releaseId: config.releaseId || 'unknown',
      thresholds: {
        memoryUsage: 80,
        cpuUsage: 70,
        responseTime: 1000,
        errorRate: 5,
        uptime: 300, // 5 minutes
        ...config.thresholds
      },
      enableSystemChecks: config.enableSystemChecks !== false,
      timeout: config.timeout || 10000,
      detailed: config.detailed || false,
      tags: config.tags || []
    };

    this.startTime = Date.now();

    // Add default system checks
    if (this.config.enableSystemChecks) {
      this.addSystemChecks();
    }
  }

  /**
   * Register a health check
   */
  addCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  /**
   * Remove a health check
   */
  removeCheck(name: string): boolean {
    return this.checks.delete(name);
  }

  /**
   * Get all registered checks
   */
  getChecks(): HealthCheck[] {
    return Array.from(this.checks.values());
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<HealthResponse> {
    const startTime = Date.now();
    const checkResults: Record<string, HealthCheckResult> = {};
    
    // Run all registered checks
    const checkPromises = Array.from(this.checks.values()).map(async (check) => {
      const result = await this.runSingleCheck(check);
      checkResults[result.name] = result;
      this.lastResults.set(result.name, result);
      return result;
    });

    // Wait for all checks to complete
    await Promise.allSettled(checkPromises);

    const duration = Date.now() - startTime;

    // Calculate summary
    const summary = this.calculateSummary(checkResults);
    const overallStatus = this.determineOverallStatus(summary);

    // Get system information
    const system = await this.getSystemInfo();

    // Build response
    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration,
      version: this.config.version,
      releaseId: this.config.releaseId,
      checks: checkResults,
      summary,
      system
    };

    return response;
  }

  /**
   * Run liveness probe (critical checks only)
   */
  async runLivenessProbe(): Promise<HealthResponse> {
    const criticalChecks = Array.from(this.checks.values())
      .filter(check => check.critical !== false);

    const startTime = Date.now();
    const checkResults: Record<string, HealthCheckResult> = {};

    // Run only critical checks
    for (const check of criticalChecks) {
      const result = await this.runSingleCheck(check);
      checkResults[result.name] = result;
    }

    const duration = Date.now() - startTime;
    const summary = this.calculateSummary(checkResults);
    const overallStatus = summary.failed > 0 ? 'fail' : 'pass';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration,
      checks: checkResults,
      summary,
      system: await this.getSystemInfo()
    };
  }

  /**
   * Run readiness probe (check if application is ready)
   */
  async runReadinessProbe(): Promise<HealthResponse> {
    const readyChecks = Array.from(this.checks.values())
      .filter(check => check.tags?.includes('readiness'));

    const startTime = Date.now();
    const checkResults: Record<string, HealthCheckResult> = {};

    // Run readiness checks
    for (const check of readyChecks) {
      const result = await this.runSingleCheck(check);
      checkResults[result.name] = result;
    }

    const duration = Date.now() - startTime;
    const summary = this.calculateSummary(checkResults);
    const overallStatus = summary.failed > 0 ? 'fail' : 'pass';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration,
      checks: checkResults,
      summary,
      system: await this.getSystemInfo()
    };
  }

  /**
   * Get last health check result
   */
  getLastResult(name: string): HealthCheckResult | undefined {
    return this.lastResults.get(name);
  }

  /**
   * Get all last results
   */
  getAllLastResults(): Map<string, HealthCheckResult> {
    return new Map(this.lastResults);
  }

  /**
   * Create Express middleware for health endpoint
   */
  createMiddleware(path: string = '/health') {
    return async (req: Request, res: Response) => {
      try {
        let healthResponse: HealthResponse;

        // Determine type of health check based on query parameters
        if (req.query.type === 'liveness') {
          healthResponse = await this.runLivenessProbe();
        } else if (req.query.type === 'readiness') {
          healthResponse = await this.runReadinessProbe();
        } else if (req.query.type === 'detailed' || this.config.detailed) {
          healthResponse = await this.runHealthChecks();
        } else {
          // Default to full health check
          healthResponse = await this.runHealthChecks();
        }

        // Set appropriate status code
        const statusCode = healthResponse.status === 'pass' ? 200 : 
                         healthResponse.status === 'warn' ? 200 : 503;

        res.status(statusCode);

        // Return JSON or plain text based on accept header
        if (req.accepts('json')) {
          res.json(healthResponse);
        } else {
          // Plain text format
          res.send(this.formatPlainTextHealth(healthResponse));
        }

      } catch (error) {
        qerrors(
          error instanceof Error ? error : new Error(String(error)),
          'HealthChecker.createMiddleware',
          'Health check middleware failed'
        );

        res.status(503).json({
          status: 'fail',
          timestamp: new Date().toISOString(),
          error: 'Health check failed to execute'
        });
      }
    };
  }

  /**
   * Add default system checks
   */
  private addSystemChecks(): void {
    // Memory usage check
    this.addCheck({
      name: 'memory',
      critical: true,
      tags: ['system', 'resource'],
      check: async () => {
        const memUsage = process.memoryUsage();
        const heapUsed = memUsage.heapUsed;
        const heapTotal = memUsage.heapTotal;
        const usage = (heapUsed / heapTotal) * 100;

        if (usage > (this.config.thresholds.memoryUsage || 80)) {
          return false;
        }

        return true;
      }
    });

    // CPU usage check
    this.addCheck({
      name: 'cpu',
      critical: false,
      tags: ['system', 'resource'],
      check: async () => {
        const cpuUsage = this.getCpuUsage();
        
        if (cpuUsage > (this.config.thresholds.cpuUsage || 70)) {
          return false;
        }

        return true;
      }
    });

    // Uptime check
    this.addCheck({
      name: 'uptime',
      critical: true,
      tags: ['system', 'availability'],
      check: async () => {
        const uptime = process.uptime();
        const minUptime = this.config.thresholds.uptime || 300; // 5 minutes

        return uptime >= minUptime;
      }
    });

    // Event loop responsiveness check
    this.addCheck({
      name: 'event_loop',
      critical: true,
      tags: ['system', 'performance'],
      check: async () => {
        const startTime = Date.now();
        
        return new Promise((resolve) => {
          setImmediate(() => {
            const lag = Date.now() - startTime;
            const maxLag = (this.config.thresholds.responseTime || 1000) / 2;
            
            resolve(lag <= maxLag);
          });
        });
      }
    });
  }

  /**
   * Run a single health check
   */
  private async runSingleCheck(check: HealthCheck): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timeout = check.timeout || this.config.timeout;

    try {
      // Run check with timeout
      const result = await this.runWithTimeout(
        check.check,
        timeout
      );

      const duration = Date.now() - startTime;
      
      return {
        name: check.name,
        status: result ? 'pass' : 'fail',
        duration,
        tags: check.tags,
        timestamp: Date.now()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name: check.name,
        status: 'fail',
        duration,
        message: error instanceof Error ? error.message : String(error),
        tags: check.tags,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Run function with timeout
   */
  private async runWithTimeout<T>(
    fn: () => Promise<T> | T,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Health check timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        const result = fn();
        
        if (result instanceof Promise) {
          result
            .then(value => {
              clearTimeout(timer);
              resolve(value);
            })
            .catch(error => {
              clearTimeout(timer);
              reject(error);
            });
        } else {
          clearTimeout(timer);
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Calculate summary of check results
   */
  private calculateSummary(checkResults: Record<string, HealthCheckResult>): {
    total: number;
    passed: number;
    failed: number;
    warned: number;
    critical: number;
  } {
    const results = Object.values(checkResults);
    
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warned: results.filter(r => r.status === 'warn').length,
      critical: results.length // All health checks are critical in this context
    };

    return summary;
  }

  /**
   * Determine overall health status
   */
  private determineOverallStatus(summary: {
    total: number;
    passed: number;
    failed: number;
    warned: number;
    critical: number;
  }): 'pass' | 'fail' | 'warn' {
    if (summary.failed > 0) {
      return 'fail';
    }
    
    if (summary.warned > 0) {
      return 'warn';
    }
    
    return 'pass';
  }

  /**
   * Get system information
   */
  private async getSystemInfo(): Promise<{
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
  }> {
    const memUsage = process.memoryUsage();
    const cpuUsage = this.getCpuUsage();
    
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      cpu: {
        usage: cpuUsage,
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
      }
    };
  }

  /**
   * Get CPU usage (simplified)
   */
  private getCpuUsage(): number {
    // This is a simplified CPU usage calculation
    // In production, you'd want more sophisticated CPU monitoring
    const startUsage = process.cpuUsage();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = endUsage.user + endUsage.system;
        const percentage = (totalUsage / 1000000) * 100; // Convert to percentage
        
        resolve(Math.min(100, percentage));
      }, 100);
    }) as any;
  }

  /**
   * Format health response as plain text
   */
  private formatPlainTextHealth(health: HealthResponse): string {
    const lines = [
      `Health Status: ${health.status.toUpperCase()}`,
      `Timestamp: ${health.timestamp}`,
      `Duration: ${health.duration}ms`,
      `Version: ${health.version || 'Unknown'}`,
      '',
      'Summary:',
      `  Total: ${health.summary.total}`,
      `  Passed: ${health.summary.passed}`,
      `  Failed: ${health.summary.failed}`,
      `  Warned: ${health.summary.warned}`,
      '',
      'System:',
      `  Node Version: ${health.system.nodeVersion}`,
      `  Platform: ${health.system.platform}`,
      `  Uptime: ${Math.floor(health.system.uptime)}s`,
      `  Memory Usage: ${health.system.memory.percentage.toFixed(1)}%`,
      `  CPU Usage: ${health.system.cpu.usage.toFixed(1)}%`
    ];

    return lines.join('\n');
  }

  /**
   * Get configuration
   */
  getConfig(): Required<HealthConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<HealthConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

export default HealthChecker;
export type { 
  HealthCheck, 
  HealthCheckResult, 
  HealthResponse, 
  HealthThresholds, 
  HealthConfig 
};