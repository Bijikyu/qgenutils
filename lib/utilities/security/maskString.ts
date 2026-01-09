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
const maskString = (value: any, options: any = {}) => (!value || typeof value !== 'string') ? '[REDACTED]' : (() => {
  const visibleStart: any = options.visibleStart ?? 4, visibleEnd = options.visibleEnd ?? 4, maskChar = options.maskChar || '*';
  const minLength: any = visibleStart + visibleEnd + 1;
  if (value.length <= minLength) {
    return '[REDACTED]';
  }
  const start: any = value.slice(0, visibleStart), end = value.slice(-visibleEnd);
  const maskedLength: any = value.length - visibleStart - visibleEnd;
  const masked: any = maskChar.repeat(Math.min(maskedLength, 12));
  return `${start}${masked}${end}`;
})();

export default maskString;
