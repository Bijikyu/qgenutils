'use strict';

/**
 * Masks a string while preserving some characters for debugging
 * @param {string} value - The string to mask
 * @param {Object} [options] - Configuration options
 * @param {number} [options.visibleStart=4] - Characters visible at start
 * @param {number} [options.visibleEnd=4] - Characters visible at end
 * @param {string} [options.maskChar='*'] - Character to use for masking
 * @returns {string} Masked string
 * @example
 * maskString('sk_live_abc123xyz789');
 * // Returns: 'sk_l************9789'
 */
function maskString(value, options = {}) { // mask string with partial visibility
  if (!value || typeof value !== 'string') {
    return '[REDACTED]';
  }

  const visibleStart = options.visibleStart ?? 4;
  const visibleEnd = options.visibleEnd ?? 4;
  const maskChar = options.maskChar || '*';

  const minLength = visibleStart + visibleEnd + 1; // minimum length to show partial

  if (value.length <= minLength) {
    return '[REDACTED]';
  }

  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  const maskedLength = value.length - visibleStart - visibleEnd;
  const masked = maskChar.repeat(Math.min(maskedLength, 12)); // cap mask length

  return `${start}${masked}${end}`;
}

module.exports = maskString;
