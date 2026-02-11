/**
 * Centralized Error Handling Utility for Consistent Error Management
 *
 * PURPOSE: Provides standardized error handling across all utility functions,
 * eliminating duplicate error handling code and ensuring consistent logging
 * and fallback behavior throughout the codebase.
 *
 * IMPLEMENTATION STRATEGY:
 * - Centralize error logging with qerrors integration
 * - Standardize error message formatting
 * - Provide consistent fallback value handling
 * - Support contextual information for debugging
 * - Maintain type safety for error scenarios
 *
 * USAGE PATTERNS:
 * - Replace repetitive catch blocks across utilities
 * - Standardize error logging format
 * - Ensure consistent fallback behavior
 * - Reduce code duplication in error handling
 *
 * @param error - The error that occurred (can be any type)
 * @param functionName - Name of the function where error occurred
 * @param context - Additional context information for debugging
 * @param fallbackValue - Safe fallback value to return
 * @returns Safe fallback value
 * @throws Never throws - always returns fallback value
 */

import qerrorsMod from '@bijikyu/qerrors';
const qerrors = (qerrorsMod as any).qerr || (qerrorsMod as any).qerrors || qerrorsMod;
import logger from '../../logger.js';

export function handleUtilityError(
  error: unknown,
  functionName: string,
  context: Record<string, any> = {},
  fallbackValue: any
): any {
  // Log error with standardized format
  logger.error(`${functionName} failed with error`, {
    error: error instanceof Error ? error.message : String(error),
    ...context
  });

  // Report error through qerrors system
  qerrors(error instanceof Error ? error : new Error(String(error)), functionName);

  // Return safe fallback value
  return fallbackValue;
}

/**
 * Specialized error handler for async operations with additional context
 *
 * @param error - The error that occurred
 * @param functionName - Name of the function where error occurred
 * @param operation - Description of the async operation
 * @param context - Additional context information
 * @param fallbackValue - Safe fallback value to return
 * @returns Safe fallback value
 */
export function handleAsyncUtilityError(
  error: unknown,
  functionName: string,
  operation: string,
  context: Record<string, any> = {},
  fallbackValue: any
): any {
  return handleUtilityError(error, functionName, { operation, ...context }, fallbackValue);
}

/**
 * Error handler for validation failures with specific validation context
 *
 * @param error - The validation error
 * @param functionName - Name of the function where validation failed
 * @param input - The input that failed validation
 * @param expectedType - Expected type or format
 * @param fallbackValue - Safe fallback value to return
 * @returns Safe fallback value
 */
export function handleValidationError(
  error: unknown,
  functionName: string,
  input: any,
  expectedType: string,
  fallbackValue: any
): any {
  return handleUtilityError(error, functionName, {
    validationFailure: true,
    input,
    expectedType,
    inputType: typeof input
  }, fallbackValue);
}
