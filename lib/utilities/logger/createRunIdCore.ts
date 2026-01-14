/**
 * Core run ID generator with secure fallbacks.
 *
 * PURPOSE: Creates stable run identifiers using an optional external generator,
 * with timestamp and secure random fallback for uniqueness.
 *
 * IMPLEMENTATION FEATURES:
 * - Prefix Sanitization: Trims and replaces spaces with underscores
 * - External ID Support: Uses provided executionId when available
 * - Deterministic Mode: Supports timestampProvider for testing
 * - Secure Fallback: Uses crypto.randomBytes for uniqueness
 *
 * @module logger/createRunIdCore
 */

import { randomBytes } from 'crypto';

type TimestampProvider = () => number;

/**
 * Generate a run identifier with prefix and optional execution ID.
 *
 * @param prefix - Human-readable prefix describing the operation
 * @param executionId - Optional externally supplied execution ID
 * @param timestampProvider - Optional timestamp generator for deterministic tests
 * @returns Run identifier in the form `${prefix}-${token}`
 *
 * @example
 * createRunIdCore('sync'); // 'sync-1704067200000-a1b2c3d4'
 * createRunIdCore('job', 'exec_123'); // 'job-exec_123'
 * createRunIdCore('test', undefined, () => 1000); // 'test-1000'
 */
function createRunIdCore(
  prefix: string,
  executionId?: string,
  timestampProvider?: TimestampProvider
): string {
  const safePrefix = typeof prefix === 'string' && prefix.trim()
    ? prefix.trim().replace(/\s+/g, '_')
    : 'run';

  if (executionId) {
    return `${safePrefix}-${executionId}`;
  }

  const ts = timestampProvider ? timestampProvider() : Date.now();

  if (timestampProvider) {
    return `${safePrefix}-${ts}`;
  }

  const fallbackRandom = randomBytes(4).toString('hex');
  return `${safePrefix}-${ts}-${fallbackRandom}`;
}

export default createRunIdCore;
export { createRunIdCore, type TimestampProvider };
