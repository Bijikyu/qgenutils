/**
 * Creates timeout configuration with context awareness.
 *
 * PURPOSE: Builds a complete timeout configuration object with the operation
 * type for logging/debugging. Supports custom timeout overrides and multipliers
 * for scaling base timeouts. Warns about unusually long timeouts (>5 minutes).
 *
 * @param {string} operation - Type of operation
 * @param {number} [customTimeout] - Optional custom timeout override
 * @param {number} [multiplier=1] - Optional multiplier for base timeout
 * @returns {{ timeoutMs: number; operationType: string }} Timeout configuration
 */
import getContextualTimeout from './getContextualTimeout.js';

function createTimeoutConfig(operation, customTimeout, multiplier = 1) {
  const baseTimeout: any = getContextualTimeout(operation);
  const finalTimeout: any = customTimeout ?? Math.round(baseTimeout * multiplier);

  if (finalTimeout > 300000) {
    console.warn(`Long timeout configured: ${finalTimeout}ms for operation: ${operation}`);
  }

  return {
    timeoutMs: finalTimeout,
    operationType: operation
  };
}

export default createTimeoutConfig;
