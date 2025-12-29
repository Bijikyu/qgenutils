/**
 * Circuit Breaker Pattern Implementation
 * 
 * PURPOSE: Prevents cascading failures by detecting and temporarily
 * disabling failing services. Provides intelligent recovery and monitoring
 * for resilient distributed systems.
 * 
 * CIRCUIT BREAKER FEATURES:
 * - Failure detection with configurable thresholds
 * - Automatic circuit state transitions (CLOSED, OPEN, HALF_OPEN)
 * - Recovery with exponential backoff
 * - Performance metrics and monitoring
 * - Customizable failure conditions
 * - Timeout protection
 */

import { qerrors } from 'qerrors';

enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation, requests pass through
  OPEN = 'OPEN',         // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN' // Testing recovery, limited requests allowed
}

interface CircuitBreakerConfig {
  name: string;
  failureThreshold?: number;      // Number of failures before opening
  recoveryTimeout?: number;        // Time to wait before transitioning to HALF_OPEN
  monitoringPeriod?: number;       // Time window for failure counting
  expectedException?: (error: any) => boolean; // Custom failure detection
  timeout?: number;               // Request timeout
  resetTimeout?: number;           // Time before trying to recover
  halfOpenMaxCalls?: number;       // Max calls in HALF_OPEN state
  enableMetrics?: boolean;
}

interface CircuitBreakerMetrics {
  name: string;
  state: CircuitState;
  failures: number;
  successes: number;
  totalCalls: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  stateChangedAt: number;
  averageResponseTime: number;
  failureRate: number;
}

class CircuitBreaker<T extends any[], R = any> {
  private config: Required<CircuitBreakerConfig>;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private lastSuccessTime = 0;
  private stateChangedAt = Date.now();
  private halfOpenCalls = 0;
  private responseTimes: number[] = [];
  private readonly MAX_RESPONSE_TIMES = 100;

  constructor(
    private fn: (...args: T) => Promise<R>,
    config: CircuitBreakerConfig
  ) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000,    // 1 minute
      monitoringPeriod: 10000,   // 10 seconds
      expectedException: () => true,
      timeout: 30000,            // 30 seconds
      resetTimeout: 60000,       // 1 minute
      halfOpenMaxCalls: 3,
      enableMetrics: true,
      ...config
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute(...args: T): Promise<R> {
    const startTime = Date.now();

    try {
      // Check if circuit should allow execution
      if (!this.shouldAllowExecution()) {
        throw new Error(`Circuit breaker '${this.config.name}' is ${this.state}`);
      }

      // Execute with timeout protection
      const result = await this.executeWithTimeout(this.fn, args, this.config.timeout);

      // Record success
      this.recordSuccess(Date.now() - startTime);

      return result;

    } catch (error) {
      // Record failure
      this.recordFailure(error, Date.now() - startTime);

      // Check if this is an expected exception
      if (this.config.expectedException(error)) {
        throw error; // Re-throw expected exceptions
      } else {
        // Wrap unexpected exceptions
        throw new Error(`Circuit breaker '${this.config.name}' error: ${error}`);
      }
    }
  }

  /**
   * Get current circuit state and metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    const totalCalls = this.failureCount + this.successCount;
    const failureRate = totalCalls > 0 ? (this.failureCount / totalCalls) * 100 : 0;
    
    const averageResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 0;

    return {
      name: this.config.name,
      state: this.state,
      failures: this.failureCount,
      successes: this.successCount,
      totalCalls,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      averageResponseTime,
      failureRate
    };
  }

  /**
   * Reset circuit breaker to CLOSED state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.lastSuccessTime = 0;
    this.stateChangedAt = Date.now();
    this.halfOpenCalls = 0;
    this.responseTimes.length = 0;
  }

  /**
   * Force circuit to OPEN state (useful for testing)
   */
  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.stateChangedAt = Date.now();
  }

  /**
   * Check if execution should be allowed
   */
  private shouldAllowExecution(): boolean {
    switch (this.state) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN:
        // Check if recovery timeout has passed
        const timeInOpenState = Date.now() - this.stateChangedAt;
        return timeInOpenState >= this.config.recoveryTimeout;

      case CircuitState.HALF_OPEN:
        // Allow limited number of calls in HALF_OPEN state
        return this.halfOpenCalls < this.config.halfOpenMaxCalls;

      default:
        return false;
    }
  }

  /**
   * Record successful execution
   */
  private recordSuccess(responseTime: number): void {
    this.successCount++;
    this.lastSuccessTime = Date.now();
    
    // Record response time
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.MAX_RESPONSE_TIMES) {
      this.responseTimes.shift();
    }

    // State transitions based on current state
    switch (this.state) {
      case CircuitState.CLOSED:
        // In CLOSED state, reset failure count on success
        this.failureCount = 0;
        break;

      case CircuitState.HALF_OPEN:
        // In HALF_OPEN state, transition to CLOSED on success
        this.state = CircuitState.CLOSED;
        this.stateChangedAt = Date.now();
        this.failureCount = 0;
        this.halfOpenCalls = 0;
        break;
    }
  }

  /**
   * Record failed execution
   */
  private recordFailure(error: any, responseTime: number): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    // Record response time even for failures
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.MAX_RESPONSE_TIMES) {
      this.responseTimes.shift();
    }

    // State transitions based on current state
    switch (this.state) {
      case CircuitState.CLOSED:
        // Check if failure threshold is reached
        if (this.failureCount >= this.config.failureThreshold) {
          this.state = CircuitState.OPEN;
          this.stateChangedAt = Date.now();
        }
        break;

      case CircuitState.HALF_OPEN:
        // Any failure in HALF_OPEN opens the circuit
        this.state = CircuitState.OPEN;
        this.stateChangedAt = Date.now();
        this.halfOpenCalls = 0;
        break;

      case CircuitState.OPEN:
        // Already open, no state change needed
        break;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<R>(
    fn: (...args: any[]) => Promise<R>,
    args: any[],
    timeout: number
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Circuit breaker timeout after ${timeout}ms`));
      }, timeout);

      fn(...args)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Check if circuit is currently open
   */
  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  /**
   * Check if circuit is currently closed
   */
  isClosed(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Check if circuit is currently half-open
   */
  isHalfOpen(): boolean {
    return this.state === CircuitState.HALF_OPEN;
  }

  /**
   * Get configuration
   */
  getConfig(): Required<CircuitBreakerConfig> {
    return { ...this.config };
  }
}

/**
 * Circuit Breaker Manager for multiple circuits
 */
class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker<any, any>> = new Map();

  /**
   * Create or get a circuit breaker
   */
  createCircuitBreaker<T extends any[], R>(
    name: string,
    fn: (...args: T) => Promise<R>,
    config: CircuitBreakerConfig
  ): CircuitBreaker<T, R> {
    if (this.breakers.has(name)) {
      return this.breakers.get(name) as CircuitBreaker<T, R>;
    }

    const breaker = new CircuitBreaker<T, R>(fn, { ...config, name });
    this.breakers.set(name, breaker as CircuitBreaker<any, any>);
    
    return breaker;
  }

  /**
   * Get circuit breaker by name
   */
  getCircuitBreaker<T extends any[], R>(name: string): CircuitBreaker<T, R> | undefined {
    return this.breakers.get(name) as CircuitBreaker<T, R> | undefined;
  }

  /**
   * Get all circuit breaker metrics
   */
  getAllMetrics(): CircuitBreakerMetrics[] {
    return Array.from(this.breakers.values()).map(breaker => breaker.getMetrics());
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Remove circuit breaker
   */
  removeCircuitBreaker(name: string): boolean {
    return this.breakers.delete(name);
  }

  /**
   * Get circuit breaker names
   */
  getCircuitNames(): string[] {
    return Array.from(this.breakers.keys());
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalCircuits: number;
    openCircuits: number;
    closedCircuits: number;
    halfOpenCircuits: number;
    totalFailures: number;
    totalSuccesses: number;
  } {
    const metrics = this.getAllMetrics();
    
    return {
      totalCircuits: metrics.length,
      openCircuits: metrics.filter(m => m.state === CircuitState.OPEN).length,
      closedCircuits: metrics.filter(m => m.state === CircuitState.CLOSED).length,
      halfOpenCircuits: metrics.filter(m => m.state === CircuitState.HALF_OPEN).length,
      totalFailures: metrics.reduce((sum, m) => sum + m.failures, 0),
      totalSuccesses: metrics.reduce((sum, m) => sum + m.successes, 0)
    };
  }
}

// Global circuit breaker manager instance
const globalCircuitBreakerManager = new CircuitBreakerManager();

export default CircuitBreaker;
export { 
  CircuitBreakerManager, 
  globalCircuitBreakerManager, 
  CircuitState 
};
export type { 
  CircuitBreakerConfig, 
  CircuitBreakerMetrics 
};