/**
 * Takes first n elements from array.
 *
 * PURPOSE: Limits results for pagination, previews, or
 * sampling the beginning of a dataset.
 *
 * @param {Array} array - Source array
 * @param {number} n - Number of elements to take
 * @returns {Array} First n elements
 */
function take(array, n) {
  if (!Array.isArray(array)) return [];
  return array.slice(0, Math.max(0, n));
}

export default take;
