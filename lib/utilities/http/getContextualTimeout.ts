import { qerrors } from 'qerrors';
import contextualTimeouts from './contextualTimeouts.js';

/**
 * Gets contextual timeout based on operation type.
 *
 * PURPOSE: Returns the appropriate timeout in milliseconds for a given
 * operation type. Falls back to default timeout for unknown operation types.
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
