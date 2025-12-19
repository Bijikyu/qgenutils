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
const maskString = (value, options = {}) => (!value || typeof value !== 'string') ? '[REDACTED]' : (() => {
  const visibleStart = options.visibleStart ?? 4, visibleEnd = options.visibleEnd ?? 4, maskChar = options.maskChar || '*';
  const minLength = visibleStart + visibleEnd + 1;
  return value.length <= minLength ? '[REDACTED]' : (() => {
    const start = value.slice(0, visibleStart), end = value.slice(-visibleEnd);
    const maskedLength = value.length - visibleStart - visibleEnd;
    const masked = maskChar.repeat(Math.min(maskedLength, 12));
    return `${start}${masked}${end}`;
  })();
})();

module.exports = maskString;
