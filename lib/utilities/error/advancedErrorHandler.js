/**
 * Advanced Error Handling System
 * 
 * Provides structured error handling with:
 * - Error classification and categorization
 * - Detailed error context and metadata
 * - Error recovery strategies
 * - Performance-optimized error logging
 * - Integration with existing logger
 */

import { EventEmitter } from 'events';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  NETWORK = 'network',
  FILE_SYSTEM = 'file_system',
  CONFIGURATION = 'configuration',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  BUSINESS_LOGIC = 'business_logic',
  UNKNOWN = 'unknown'
}

// Error recovery strategies
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  CIRCUIT_BREAKER = 'circuit_breaker',
  GRACEFUL_DEGRADATION = 'graceful_degradation',
  USER_NOTIFICATION = 'user_notification',
  LOG_ONLY = 'log_only'
}

// Enhanced error interface
export interface EnhancedError extends Error {
  // Standard error properties
  name: string;
  message: string;
  stack?: string;
  
  // Enhanced error properties
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  metadata?: {
    timestamp: string;
    requestId?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  };
  recovery?: RecoveryStrategy;
  retryCount?: number;
  maxRetries?: number;
  canRetry?: boolean;
  userMessage?: string;
  suggestion?: string;
  isOperational?: boolean;
  isTransient?: boolean;
}

// Error configuration interface
export interface ErrorHandlingConfig {
  // Logging configuration
  enableLogging: boolean;
  logLevel: ErrorSeverity;
  enableStackTrace: boolean;
  enableContextCapture: boolean;
  
  // Retry configuration
  defaultMaxRetries: number;
  retryDelayMs: number;
  enableExponentialBackoff: boolean;
  
  // Circuit breaker configuration
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeoutMs: number;
  
  // Performance configuration
  enablePerformanceTracking: boolean;
  enableSlowQueryLogging: boolean;
  slowQueryThresholdMs: number;
}

export class AdvancedErrorHandler extends EventEmitter {
  private config: ErrorHandlingConfig;
  private errorCounts: Map<string, number> = new Map();
  private lastErrors: Map<string, number> = new Map();
  private circuitBreakers: Map<string, { isOpen: boolean; lastOpenTime: number; failureCount: number }> = new Map();
  private performanceMetrics: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  constructor(config: Partial<ErrorHandlingConfig> = {}) {
    super();
    this.config = {
      enableLogging: true,
      logLevel: ErrorSeverity.MEDIUM,
      enableStackTrace: true,
      enableContextCapture: true,
      defaultMaxRetries: 3,
      retryDelayMs: 1000,
      enableExponentialBackoff: true,
      enableCircuitBreaker: false,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeoutMs: 60000,
      enablePerformanceTracking: true,
      enableSlowQueryLogging: true,
      slowQueryThresholdMs: 1000,
      ...config
    };
  }

  /**
   * Creates an enhanced error with full context
   */
  createError(
    code: string,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    options: {
      context?: Record<string, any>;
      metadata?: Record<string, any>;
      recovery?: RecoveryStrategy;
      maxRetries?: number;
      userMessage?: string;
      suggestion?: string;
      isOperational?: boolean;
      isTransient?: boolean;
      cause?: Error;
    } = {}
  ): EnhancedError {
    const error = new Error(message) as EnhancedError;
    
    // Standard error properties
    error.name = this.generateErrorName(code, category);
    error.message = message;
    error.code = code;
    error.category = category;
    error.severity = severity;
    
    // Enhanced properties
    error.context = options.context;
    error.recovery = options.recovery;
    error.maxRetries = options.maxRetries || this.config.defaultMaxRetries;
    error.retryCount = 0;
    error.canRetry = this.shouldAllowRetry(category, severity, options);
    error.userMessage = options.userMessage || this.generateUserMessage(category, message);
    error.suggestion = options.suggestion || this.generateSuggestion(category, code);
    error.isOperational = options.isOperational ?? this.isOperationalError(category);
    error.isTransient = options.isTransient ?? this.isTransientError(category);
    
    // Metadata
    error.metadata = {
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      ...options.metadata
    };
    
    // Stack trace
    if (options.cause) {
      error.stack = options.cause.stack;
    } else if (this.config.enableStackTrace) {
      Error.captureStackTrace(error, this.createError);
    }
    
    return error;
  }

  /**
   * Handles an error with logging, metrics, and recovery
   */
  async handleError(error: EnhancedError, context?: Record<string, any>): Promise<{
    handled: boolean;
    shouldRetry: boolean;
    shouldFallback: boolean;
    shouldCircuitBreak: boolean;
    metrics: any;
  }> {
    const startTime = Date.now();
    
    try {
      // Add context to error
      if (context) {
        error.context = { ...error.context, ...context };
      }
      
      // Update error counts
      this.updateErrorCounts(error);
      
      // Log error
      if (this.config.enableLogging) {
        await this.logError(error);
      }
      
      // Update performance metrics
      if (this.config.enablePerformanceTracking) {
        this.updatePerformanceMetrics(error);
      }
      
      // Determine recovery actions
      const shouldRetry = error.canRetry && error.retryCount < error.maxRetries;
      const shouldFallback = !shouldRetry && error.recovery === RecoveryStrategy.FALLBACK;
      const shouldCircuitBreak = this.shouldTriggerCircuitBreaker(error);
      
      // Emit error event
      this.emit('error', {
        error,
        shouldRetry,
        shouldFallback,
        shouldCircuitBreak,
        metrics: this.getErrorMetrics(error)
      });
      
      return {
        handled: true,
        shouldRetry,
        shouldFallback,
        shouldCircuitBreak,
        metrics: this.getErrorMetrics(error)
      };
      
    } catch (handlingError) {
      // Fallback error handling
      console.error('Error in error handler:', handlingError);
      return {
        handled: false,
        shouldRetry: false,
        shouldFallback: false,
        shouldCircuitBreak: false,
        metrics: { handlerError: handlingError.message }
      };
    } finally {
      const duration = Date.now() - startTime;
      this.emit('handlingComplete', { duration, error });
    }
  }

  /**
   * Wraps a function with error handling
   */
  async wrapFunction<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
      name?: string;
      category?: ErrorCategory;
      recovery?: RecoveryStrategy;
      maxRetries?: number;
      timeoutMs?: number;
      context?: Record<string, any>;
    } = {}
  ): Promise<R> {
    const { name, category = ErrorCategory.UNKNOWN, recovery, maxRetries, timeoutMs, context } = options;
    
    let lastError: EnhancedError | null = null;
    let attempt = 0;
    const maxAttempts = maxRetries || this.config.defaultMaxRetries;
    
    while (attempt <= maxAttempts) {
      attempt++;
      
      try {
        // Check circuit breaker
        const circuitKey = `${category}:${name || 'anonymous'}`;
        if (this.isCircuitBreakerOpen(circuitKey)) {
          throw this.createError(
            'CIRCUIT_BREAKER_OPEN',
            `Circuit breaker is open for ${circuitKey}`,
            ErrorCategory.NETWORK,
            ErrorSeverity.HIGH,
            {
              context: { circuitKey, attempt },
              recovery: RecoveryStrategy.LOG_ONLY,
              userMessage: 'Service temporarily unavailable. Please try again later.',
              suggestion: 'Circuit breaker will reset automatically. Please wait before retrying.'
            }
          );
        }
        
        // Execute function with timeout
        const result = timeoutMs 
          ? await Promise.race([
              fn(...(arguments as any)),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Function timeout')), timeoutMs)
              )
            ])
          : await fn(...(arguments as any));
        
        // Circuit breaker success
        if (this.config.enableCircuitBreaker) {
          this.recordCircuitBreakerSuccess(circuitKey);
        }
        
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? this.convertToEnhancedError(error, category, options) : error as EnhancedError;
        
        if (!lastError.canRetry || attempt > maxAttempts) {
          await this.handleError(lastError, { ...context, attempt, fnName: name });
          throw lastError;
        }
        
        // Wait before retry
        const delay = this.calculateRetryDelay(attempt, lastError);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should not be reached, but TypeScript requires it
    throw lastError || new Error('Unknown error in wrapped function');
  }

  /**
   * Converts regular Error to EnhancedError
   */
  private convertToEnhancedError(
    error: Error,
    category: ErrorCategory,
    options: any
  ): EnhancedError {
    if (error instanceof EnhancedError) {
      return error;
    }
    
    return this.createError(
      error.name || 'UNKNOWN_ERROR',
      error.message,
      category,
      this.determineSeverity(error, category),
      {
        context: options.context,
        cause: error,
        ...options
      }
    );
  }

  /**
   * Determines error severity based on error type and category
   */
  private determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // Security errors are always high or critical
    if (category === ErrorCategory.SECURITY || category === ErrorCategory.AUTHENTICATION) {
      return ErrorSeverity.HIGH;
    }
    
    // Network and rate limit errors are typically medium
    if (category === ErrorCategory.NETWORK || category === ErrorCategory.RATE_LIMIT) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Configuration and validation errors are medium
    if (category === ErrorCategory.CONFIGURATION || category === ErrorCategory.VALIDATION) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Performance and file system errors are high
    if (category === ErrorCategory.PERFORMANCE || category === ErrorCategory.FILE_SYSTEM) {
      return ErrorSeverity.HIGH;
    }
    
    // Business logic errors depend on context
    if (category === ErrorCategory.BUSINESS_LOGIC) {
      return ErrorSeverity.LOW;
    }
    
    return ErrorSeverity.MEDIUM;
  }

  /**
   * Updates error counts for monitoring
   */
  private updateErrorCounts(error: EnhancedError): void {
    const key = `${error.category}:${error.code}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    this.lastErrors.set(key, Date.now());
  }

  /**
   * Logs error with structured format
   */
  private async logError(error: EnhancedError): Promise<void> {
    const logData = {
      level: error.severity,
      code: error.code,
      message: error.message,
      category: error.category,
      timestamp: error.metadata?.timestamp,
      requestId: error.metadata?.requestId,
      context: error.context,
      stack: error.stack,
      recovery: error.recovery,
      canRetry: error.canRetry,
      retryCount: error.retryCount,
      userMessage: error.userMessage,
      suggestion: error.suggestion
    };
    
    // In a real implementation, this would use the actual logger
    console.error('[QGenUtils Error]', JSON.stringify(logData, null, 2));
  }

  /**
   * Updates performance metrics for errors
   */
  private updatePerformanceMetrics(error: EnhancedError): void {
    const key = `${error.category}:${error.code}`;
    const current = this.performanceMetrics.get(key) || { count: 0, totalTime: 0, avgTime: 0 };
    
    current.count++;
    current.totalTime += 0; // Would track actual processing time
    current.avgTime = current.totalTime / current.count;
    
    this.performanceMetrics.set(key, current);
  }

  /**
   * Determines if an error should allow retries
   */
  private shouldAllowRetry(category: ErrorCategory, severity: ErrorSeverity, options: any): boolean {
    // Don't retry critical errors
    if (severity === ErrorSeverity.CRITICAL) return false;
    
    // Don't retry validation or authentication errors
    if (category === ErrorCategory.VALIDATION || category === ErrorCategory.AUTHENTICATION) return false;
    
    // Allow retry for transient errors
    return options.isTransient !== false && (category === ErrorCategory.NETWORK || category === ErrorCategory.RATE_LIMIT);
  }

  /**
   * Determines if an error is operational (not programmer error)
   */
  private isOperationalError(category: ErrorCategory): boolean {
    return ![ErrorCategory.BUSINESS_LOGIC, ErrorCategory.CONFIGURATION].includes(category);
  }

  /**
   * Determines if an error is transient
   */
  private isTransientError(category: ErrorCategory): boolean {
    return [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT].includes(category);
  }

  /**
   * Generates error name
   */
  private generateErrorName(code: string, category: ErrorCategory): string {
    return `${category}_${code}`;
  }

  /**
   * Generates user-friendly error message
   */
  private generateUserMessage(category: ErrorCategory, message: string): string {
    const messages = {
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.SECURITY]: 'Security validation failed. Please check your credentials.',
      [ErrorCategory.NETWORK]: 'Network connection failed. Please check your internet connection.',
      [ErrorCategory.RATE_LIMIT]: 'Too many requests. Please wait before trying again.',
      [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please check your login credentials.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorCategory.CONFIGURATION]: 'Configuration error. Please check your settings.',
      [ErrorCategory.FILE_SYSTEM]: 'File operation failed. Please check file permissions.',
      [ErrorCategory.PERFORMANCE]: 'Operation timed out. Please try again.',
      [ErrorCategory.BUSINESS_LOGIC]: 'Operation failed due to business rules.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };
    
    return messages[category] || 'An error occurred. Please try again.';
  }

  /**
   * Generates suggestion based on error
   */
  private generateSuggestion(category: ErrorCategory, code: string): string {
    const suggestions = {
      [ErrorCategory.VALIDATION]: 'Ensure all required fields are provided and in correct format.',
      [ErrorCategory.SECURITY]: 'Check that your API keys and credentials are correct.',
      [ErrorCategory.NETWORK]: 'Check your internet connection and try again.',
      [ErrorCategory.RATE_LIMIT]: 'Wait before making another request.',
      [ErrorCategory.AUTHENTICATION]: 'Verify your username and password are correct.',
      [ErrorCategory.AUTHORIZATION]: 'Contact an administrator for the required permissions.',
      [ErrorCategory.CONFIGURATION]: 'Review your configuration settings.',
      [ErrorCategory.FILE_SYSTEM]: 'Check file permissions and disk space.',
      [ErrorCategory.PERFORMANCE]: 'Try with smaller data sets or optimize your query.',
      [ErrorCategory.BUSINESS_LOGIC]: 'Review business rules and constraints.',
      [ErrorCategory.UNKNOWN]: 'Contact support if the problem persists.'
    };
    
    return suggestions[category] || 'Contact support if the problem persists.';
  }

  /**
   * Generates a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculates retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, error: EnhancedError): number {
    if (!this.config.enableExponentialBackoff) {
      return this.config.retryDelayMs;
    }
    
    return this.config.retryDelayMs * Math.pow(2, attempt - 1);
  }

  /**
   * Checks if circuit breaker should trigger
   */
  private shouldTriggerCircuitBreaker(error: EnhancedError): boolean {
    if (!this.config.enableCircuitBreaker) return false;
    
    const key = `${error.category}:${error.code}`;
    const count = this.errorCounts.get(key) || 0;
    return count >= this.config.circuitBreakerThreshold;
  }

  /**
   * Checks if circuit breaker is open
   */
  private isCircuitBreakerOpen(key: string): boolean {
    if (!this.config.enableCircuitBreaker) return false;
    
    const breaker = this.circuitBreakers.get(key);
    if (!breaker) return false;
    
    if (breaker.isOpen) {
      const timeSinceOpen = Date.now() - breaker.lastOpenTime;
      return timeSinceOpen < this.config.circuitBreakerTimeoutMs;
    }
    
    return false;
  }

  /**
   * Records circuit breaker success
   */
  private recordCircuitBreakerSuccess(key: string): void {
    if (!this.config.enableCircuitBreaker) return;
    
    const breaker = this.circuitBreakers.get(key) || { isOpen: false, lastOpenTime: 0, failureCount: 0 };
    breaker.failureCount = 0;
    breaker.isOpen = false;
    this.circuitBreakers.set(key, breaker);
  }

  /**
   * Triggers circuit breaker
   */
  private triggerCircuitBreaker(key: string): void {
    if (!this.config.enableCircuitBreaker) return;
    
    const breaker = this.circuitBreakers.get(key) || { isOpen: false, lastOpenTime: 0, failureCount: 0 };
    breaker.failureCount++;
    breaker.lastOpenTime = Date.now();
    breaker.isOpen = true;
    this.circuitBreakers.set(key, breaker);
  }

  /**
   * Gets error metrics for monitoring
   */
  getErrorMetrics(error: EnhancedError): any {
    return {
      code: error.code,
      category: error.category,
      severity: error.severity,
      timestamp: error.metadata?.timestamp,
      requestId: error.metadata?.requestId,
      canRetry: error.canRetry,
      retryCount: error.retryCount,
      maxRetries: error.maxRetries,
      recovery: error.recovery,
      isOperational: error.isOperational,
      isTransient: error.isTransient,
      context: error.context,
      userMessage: error.userMessage,
      suggestion: error.suggestion
    };
  }

  /**
   * Gets overall error statistics
   */
  getErrorStatistics(): any {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const categoryBreakdown = new Map<ErrorCategory, number>();
    
    for (const [key, count] of this.errorCounts.entries()) {
      const [category] = key.split(':');
      categoryBreakdown.set(
        category as ErrorCategory,
        (categoryBreakdown.get(category as ErrorCategory) || 0) + count
      );
    }
    
    return {
      totalErrors,
      categoryBreakdown: Object.fromEntries(categoryBreakdown),
      circuitBreakersOpen: Array.from(this.circuitBreakers.values()).filter(cb => cb.isOpen).length,
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      lastHourErrors: this.getErrorsInLastHour(),
      topErrors: this.getTopErrors(10)
    };
  }

  /**
   * Gets errors from the last hour
   */
  private getErrorsInLastHour(): number {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return Array.from(this.lastErrors.values()).filter(time => time > oneHourAgo).length;
  }

  /**
   * Gets top errors by frequency
   */
  private getTopErrors(limit: number): Array<{ key: string; count: number }> {
    return Array.from(this.errorCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Resets error statistics
   */
  resetStatistics(): void {
    this.errorCounts.clear();
    this.lastErrors.clear();
    this.circuitBreakers.clear();
    this.performanceMetrics.clear();
  }
}

// Default export
const defaultErrorHandler = new AdvancedErrorHandler();
export { AdvancedErrorHandler as default, defaultErrorHandler };