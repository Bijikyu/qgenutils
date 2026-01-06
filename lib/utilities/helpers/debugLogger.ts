/**
 * Centralized Debug Logging Utility for Consistent Debug Output
 * 
 * PURPOSE: Provides standardized debug logging across all utility functions,
 * eliminating duplicate logging code and ensuring consistent debug message
 * formatting and context handling throughout the codebase.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Centralize debug logging with consistent message format
 * - Standardize context information handling
 * - Provide fluent interface for method chaining
 * - Support performance monitoring with timing
 * - Maintain type safety for context data
 * 
 * USAGE PATTERNS:
 * - Replace repetitive debug logging across utilities
 * - Standardize debug message formatting
 * - Ensure consistent context handling
 * - Reduce code duplication in logging logic
 * - Enable performance timing for function execution
 * 
 * @param functionName - Name of the function being debugged
 * @returns Debug logger interface with standardized methods
 */

import logger from '../../logger.js';

export interface DebugLogger {
  start: (input: any, context?: Record<string, any>) => void;
  success: (output: any, context?: Record<string, any>) => void;
  warn: (message: string, context?: Record<string, any>) => void;
  error: (error: unknown, context?: Record<string, any>) => void;
  step: (stepName: string, context?: Record<string, any>) => void;
  timing: {
    start: (operation?: string) => void;
    end: (operation?: string, context?: Record<string, any>) => void;
  };
}

export interface TimingInfo {
  startTime: number;
  operation?: string;
}

/**
 * Creates a debug logger instance for a specific function
 * 
 * @param functionName - Name of the function being debugged
 * @returns Debug logger interface with standardized methods
 */
export function createDebugLogger(functionName: string): DebugLogger {
  const timings = new Map<string, TimingInfo>();
  
  return {
    /**
     * Log function start with input and context
     * 
     * @param input - Input value being processed
     * @param context - Additional context information
     */
    start: (input: any, context: Record<string, any> = {}) => {
      logger.debug(`${functionName} processing input`, { input, ...context });
    },
    
    /**
     * Log successful function completion with output and context
     * 
     * @param output - Output value being returned
     * @param context - Additional context information
     */
    success: (output: any, context: Record<string, any> = {}) => {
      logger.debug(`${functionName} completed successfully`, { output, ...context });
    },
    
    /**
     * Log warning message with context
     * 
     * @param message - Warning message to log
     * @param context - Additional context information
     */
    warn: (message: string, context: Record<string, any> = {}) => {
      logger.warn(`${functionName}: ${message}`, context);
    },
    
    /**
     * Log error with context
     * 
     * @param error - Error that occurred
     * @param context - Additional context information
     */
    error: (error: unknown, context: Record<string, any> = {}) => {
      logger.error(`${functionName} failed`, { 
        error: error instanceof Error ? error.message : String(error), 
        ...context 
      });
    },
    
    /**
     * Log step completion for multi-step functions
     * 
     * @param stepName - Name of the step being completed
     * @param context - Additional context information
     */
    step: (stepName: string, context: Record<string, any> = {}) => {
      logger.debug(`${functionName}: ${stepName}`, context);
    },
    
    /**
     * Timing utilities for performance monitoring
     */
    timing: {
      /**
       * Start timing an operation
       * 
       * @param operation - Name of the operation being timed
       */
      start: (operation: string = 'default') => {
        timings.set(operation, {
          startTime: performance.now(),
          operation
        });
      },
      
      /**
       * End timing an operation and log duration
       * 
       * @param operation - Name of the operation being timed
       * @param context - Additional context information
       */
      end: (operation: string = 'default', context: Record<string, any> = {}) => {
        const timing = timings.get(operation);
        
        if (timing) {
          const endTime = performance.now();
          const duration = endTime - timing.startTime;
          
          logger.debug(`${functionName}: ${timing.operation || 'operation'} completed`, {
            duration: `${duration.toFixed(2)}ms`,
            ...context
          });
          
          timings.delete(operation);
        } else {
          logger.warn(`${functionName}: timing end called without start for ${operation}`);
        }
      }
    }
  };
}

/**
 * Performance monitoring utility for function execution timing
 * 
 * @param functionName - Name of the function being monitored
 * @returns Performance monitoring interface
 */
export function createPerformanceMonitor(functionName: string) {
  const debug = createDebugLogger(functionName);
  
  return {
    /**
     * Start monitoring function execution
     * 
     * @param input - Input being processed
     * @param context - Additional context
     */
    start: (input: any, context: Record<string, any> = {}) => {
      debug.start(input, context);
      debug.timing.start('execution');
    },
    
    /**
     * End monitoring and log performance metrics
     * 
     * @param output - Output being returned
     * @param context - Additional context
     */
    end: (output: any, context: Record<string, any> = {}) => {
      debug.timing.end('execution', context);
      debug.success(output, context);
    },
    
    /**
     * Log error with performance context
     * 
     * @param error - Error that occurred
     * @param context - Additional context
     */
    error: (error: unknown, context: Record<string, any> = {}) => {
      debug.timing.end('execution', context);
      debug.error(error, context);
    }
  };
}

/**
 * Simple debug logger for minimal logging overhead
 * 
 * @param functionName - Name of the function
 * @returns Simple debug logger interface
 */
export function createSimpleDebugLogger(functionName: string) {
  return {
    start: (input: any) => {
      logger.debug(`${functionName} processing input: ${input}`);
    },
    success: (output: any) => {
      logger.debug(`${functionName} completed successfully: ${output}`);
    },
    warn: (message: string) => {
      logger.warn(`${functionName}: ${message}`);
    },
    error: (error: unknown) => {
      logger.error(`${functionName} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
}