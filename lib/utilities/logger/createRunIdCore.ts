/**
 * Core run ID generator with secure fallbacks.
 *
 * PURPOSE: Creates stable run identifiers using an optional external generator,
 * with timestamp and secure random fallback when qgenutils is unavailable.
 *
 * @param {string} prefix - Human-readable prefix describing the operation
 * @param {string} [executionId] - Optional externally supplied execution ID
 * @param {function} [timestampProvider] - Optional timestamp generator for deterministic tests
 * @returns {string} Run identifier in the form `${prefix}-${token}`
 */

import { randomBytes } from 'crypto';

function createRunIdCore(prefix, executionId, timestampProvider) {
  const safePrefix = typeof prefix === 'string' && prefix.trim()
    ? prefix.trim().replace(/\s+/g, '_')
    : 'run';

  if (executionId) {
    return `${safePrefix}-${executionId}`;
  }

  const ts: any = timestampProvider ? timestampProvider() : Date.now();

  if (timestampProvider) {
    return `${safePrefix}-${ts}`;
  }

  const fallbackRandom: any = randomBytes(4).toString('hex');
  return `${safePrefix}-${ts}-${fallbackRandom}`;
}

export default createRunIdCore;
