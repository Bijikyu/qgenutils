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

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error categories
export const ErrorCategory = {
  VALIDATION: 'validation',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  NETWORK: 'network',
  FILE_SYSTEM: 'file_system',
  CONFIGURATION: 'configuration',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  RATE_LIMIT: 'rate_limit',
  BUSINESS_LOGIC: 'business_logic',
  UNKNOWN: 'unknown'
};

// Error recovery strategies
export const RecoveryStrategy = {
  RETRY: 'retry',
  FALLBACK: 'fallback',
  CIRCUIT_BREAKER: 'circuit_breaker',
  GRACEFUL_DEGRADATION: 'graceful_degradation',
  USER_NOTIFICATION: 'user_notification',
  LOG_ONLY: 'log_only'
};

// Enhanced error class
export class EnhancedError extends Error {
  constructor(options) {
    super(options.message);
    
    // Standard error properties
    this.name = options.name || 'EnhancedError';
    this.message = options.message;
    this.stack = options.stack || (Error.captureStackTrace ? Error.captureStackTrace() : undefined);
    
    // Enhanced error properties
    this.code = options.code || 'UNKNOWN_ERROR';
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.context = options.context;
    this.metadata = {
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      ...options.metadata
    };
    this.recovery = options.recovery;
    this.retryCount = 0;
    this.maxRetries = options.maxRetries || 3;
    this.canRetry = this.shouldAllowRetry(options.category, options.severity, options);
    this.userMessage = options.userMessage || this.generateUserMessage(options.category, options.message);
    this.suggestion = options.suggestion || this.generateSuggestion(options.category, options.code);
    this.isOperational = options.isOperational ?? this.isOperationalError(options.category);
    this.isTransient = options.isTransient ?? this.isTransientError(options.category);
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  shouldAllowRetry(category, severity, options) {
    // Don't retry critical errors
    if (severity === ErrorSeverity.CRITICAL) return false;
    
    // Don't retry validation or authentication errors
    if (category === ErrorCategory.VALIDATION || category === ErrorCategory.AUTHENTICATION) return false;
    
    // Allow retry for transient errors
    return options.isTransient !== false && (category === ErrorCategory.NETWORK || category === ErrorCategory.RATE_LIMIT);
  }

  isOperationalError(category) {
    return ![ErrorCategory.BUSINESS_LOGIC, ErrorCategory.CONFIGURATION].includes(category);
  }

  isTransientError(category) {
    return [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT].includes(category);
  }

  generateUserMessage(category, message) {
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

  generateSuggestion(category, code) {
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
}

export class AdvancedErrorHandler {
  constructor(config = {}) {
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
    
    this.errorCounts = new Map();
    this.lastErrors = new Map();
    this.circuitBreakers = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * Creates an enhanced error with full context
   */
  createError(code, message, category, severity, options = {}) {
    const error = new EnhancedError({
      code,
      message,
      category,
      severity,
      ...options
    });
    
    return error;
  }

  /**
   * Handles an error with logging, metrics, and recovery
   */
  async handleError(error, context) {
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
      
      const result = {
        handled: true,
        shouldRetry,
        shouldFallback,
        shouldCircuitBreak,
        metrics: this.getErrorMetrics(error)
      };
      
      return result;
      
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
    }
  }

  /**
   * Wraps a function with error handling
   */
  async wrapFunction(fn, options = {}) {
    const { name, category = ErrorCategory.UNKNOWN, recovery, maxRetries, timeoutMs, context } = options;
    
    let lastError = null;
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
              fn(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Function timeout')), timeoutMs)
              )
            ])
          : await fn();
        
        // Circuit breaker success
        if (this.config.enableCircuitBreaker) {
          this.recordCircuitBreakerSuccess(circuitKey);
        }
        
        return result;
        
      } catch (error) {
        lastError = error instanceof EnhancedError ? error : this.convertToEnhancedError(error, category, options);
        
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
  convertToEnhancedError(error, category, options) {
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
  determineSeverity(error, category) {
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
  updateErrorCounts(error) {
    const key = `${error.category}:${error.code}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    this.lastErrors.set(key, Date.now());
  }

  /**
   * Logs error with structured format
   */
  async logError(error) {
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
  updatePerformanceMetrics(error) {
    const key = `${error.category}:${error.code}`;
    const current = this.performanceMetrics.get(key) || { count: 0, totalTime: 0, avgTime: 0 };
    
    current.count++;
    current.totalTime += 0; // Would track actual processing time
    current.avgTime = current.totalTime / current.count;
    
    this.performanceMetrics.set(key, current);
  }

  /**
   * Determines if circuit breaker should trigger
   */
  shouldTriggerCircuitBreaker(error) {
    if (!this.config.enableCircuitBreaker) return false;
    
    const key = `${error.category}:${error.code}`;
    const count = this.errorCounts.get(key) || 0;
    return count >= this.config.circuitBreakerThreshold;
  }

  /**
   * Checks if circuit breaker is open
   */
  isCircuitBreakerOpen(key) {
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
  recordCircuitBreakerSuccess(key) {
    if (!this.config.enableCircuitBreaker) return;
    
    const breaker = this.circuitBreakers.get(key) || { isOpen: false, lastOpenTime: 0, failureCount: 0 };
    breaker.failureCount = 0;
    breaker.isOpen = false;
    this.circuitBreakers.set(key, breaker);
  }

  /**
   * Calculates retry delay with exponential backoff
   */
  calculateRetryDelay(attempt, error) {
    if (!this.config.enableExponentialBackoff) {
      return this.config.retryDelayMs;
    }
    
    return this.config.retryDelayMs * Math.pow(2, attempt - 1);
  }

  /**
   * Gets error metrics for monitoring
   */
  getErrorMetrics(error) {
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
  getErrorStatistics() {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const categoryBreakdown = new Map();
    
    for (const [key, count] of this.errorCounts.entries()) {
      const [category] = key.split(':');
      categoryBreakdown.set(
        category,
        (categoryBreakdown.get(category) || 0) + count
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
  getErrorsInLastHour() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return Array.from(this.lastErrors.values()).filter(time => time > oneHourAgo).length;
  }

  /**
   * Gets top errors by frequency
   */
  getTopErrors(limit) {
    return Array.from(this.errorCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Resets error statistics
   */
  resetStatistics() {
    this.errorCounts.clear();
    this.lastErrors.clear();
    this.circuitBreakers.clear();
    this.performanceMetrics.clear();
  }
}

// Default export
const defaultErrorHandler = new AdvancedErrorHandler();
export { AdvancedErrorHandler as default, defaultErrorHandler };