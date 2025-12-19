/**
 * Skips first n elements from array.
 *
 * PURPOSE: Pagination offset, skipping headers, or
 * starting from a specific position in a dataset.
 *
 * @param {Array} array - Source array
 * @param {number} n - Number of elements to skip
 * @returns {Array} Remaining elements after skipping n
 */
function skip(array, n) {
  if (!Array.isArray(array)) return [];
  return array.slice(Math.max(0, n));
}

export default skip;
