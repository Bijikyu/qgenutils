/**
 * Takes elements while predicate returns true.
 *
 * PURPOSE: Collects leading elements matching a condition,
 * useful for processing sorted data or finding prefixes.
 *
 * @param {Array} array - Source array
 * @param {Function} predicate - Function (item, index) => boolean
 * @returns {Array} Elements until predicate returns false
 */
function takeWhile(array, predicate) {
  if (!Array.isArray(array)) return [];
  
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      result.push(array[i]);
    } else {
      break;
    }
  }
  return result;
}

module.exports = takeWhile;
