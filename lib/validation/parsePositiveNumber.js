/**
 * Type-safe number parsing and validation primitive.
 *
 * PURPOSE: Safely converts unknown inputs (strings, numbers, etc.) into
 * validated positive numeric values. Handles edge cases like NaN, infinity,
 * and negative values. Returns a result object for predictable error handling.
 *
 * @param {unknown} value - The value to parse and validate
 * @returns {{ ok: true, value: number } | { ok: false }} Result object
 */
function parsePositiveNumber(value) {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return { ok: false };
  }
  
  const num = Number(value);
  
  if (!Number.isFinite(num) || num <= 0) {
    return { ok: false };
  }
  
  return { ok: true, value: num };
}

module.exports = parsePositiveNumber;
