import { qerrors } from 'qerrors';
import contextualTimeouts from './contextualTimeouts.js';

/**
 * Gets contextual timeout based on operation type.
 *
 * PURPOSE: Returns the appropriate timeout in milliseconds for a given
 * operation type. Falls back to default timeout for unknown operation types.
 *
 * This function provides intelligent timeout selection based on the nature
 * of the operation, preventing both premature timeouts and excessive waits.
 *
 * TIMEOUT STRATEGY:
 * - Fast operations (API calls): Shorter timeouts for quick feedback
 * - Slow operations (file uploads): Longer timeouts for completion
 * - Network operations: Balanced timeouts for reliability
 * - Unknown operations: Safe default timeout
 *
 * @example
 * ```typescript
 * import getContextualTimeout from './getContextualTimeout.js';
 * 
 * // API call with fast response expected
 * const apiTimeout = getContextualTimeout('api');
 * console.log(apiTimeout); // 5000ms
 * 
 * // File upload with slow operation expected
 * const uploadTimeout = getContextualTimeout('upload');
 * console.log(uploadTimeout); // 30000ms
 * 
 * // Database operation with medium timeout
 * const dbTimeout = getContextualTimeout('database');
 * console.log(dbTimeout); // 10000ms
 * 
 * // Unknown operation gets safe default
 * const defaultTimeout = getContextualTimeout('unknown');
 * console.log(defaultTimeout); // 8000ms (default)
 * 
 * // Using in HTTP requests
 * async function fetchWithTimeout(url: string, operation: string) {
 *   const timeout = getContextualTimeout(operation);
 *   const controller = new AbortController();
 *   const timeoutId = setTimeout(() => controller.abort(), timeout);
 *   
 *   try {
 *     const response = await fetch(url, { signal: controller.signal });
 *     clearTimeout(timeoutId);
 *     return response;
 *   } catch (error) {
 *     if (error.name === 'AbortError') {
 *       throw new Error(`Request timed out after ${timeout}ms`);
 *     }
 *     throw error;
 *   }
 * }
 * 
 * // Usage examples
 * fetchWithTimeout('/api/users', 'api');      // 5 second timeout
 * fetchWithTimeout('/upload', 'upload');       // 30 second timeout
 * fetchWithTimeout('/db/query', 'database');   // 10 second timeout
 * ```
 *
 * @param {string} operation - Type of operation being performed
 * @returns {number} Appropriate timeout in milliseconds
 */
function getContextualTimeout(operation: string): number {
  try {
    if (typeof operation !== 'string' || operation.trim() === '') {
      return (contextualTimeouts as any).default;
    }

    return (contextualTimeouts as any)[operation] ?? (contextualTimeouts as any).default;
  } catch (error) {
    const safeOperation = typeof operation === 'string' ? operation : 'undefined';
    qerrors(error instanceof Error ? error : new Error(String(error)), 'getContextualTimeout', `Contextual timeout retrieval failed for operation: ${safeOperation}`);
    return (contextualTimeouts as any).default;
  }
}

export default getContextualTimeout;
