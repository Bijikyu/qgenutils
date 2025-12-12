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

const crypto = require('crypto');

function createRunIdCore(prefix, executionId, timestampProvider) {
  const safePrefix = typeof prefix === 'string' && prefix.trim()
    ? prefix.trim().replace(/\s+/g, '_')
    : 'run';

  if (executionId) {
    return `${safePrefix}-${executionId}`;
  }

  try {
    const qgenutils = require('qgenutils');
    const generated = qgenutils?.generateExecutionId?.();
    if (generated) {
      return `${safePrefix}-${generated}`;
    }
  } catch {
  }

  const ts = timestampProvider ? timestampProvider() : Date.now();
  
  if (timestampProvider) {
    return `${safePrefix}-${ts}`;
  }

  const fallbackRandom = crypto.randomBytes(4).toString('hex');
  return `${safePrefix}-${ts}-${fallbackRandom}`;
}

module.exports = createRunIdCore;
