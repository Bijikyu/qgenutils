/**
 * Skips elements while predicate returns true.
 *
 * PURPOSE: Skips leading elements matching a condition,
 * useful for finding where data changes or skipping prefixes.
 *
 * @param {Array} array - Source array
 * @param {Function} predicate - Function (item, index) => boolean
 * @returns {Array} Elements starting from first false predicate
 */
function skipWhile(array, predicate) {
  if (!Array.isArray(array)) return [];
  
  let skipIndex = 0;
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      skipIndex = i + 1;
    } else {
      break;
    }
  }
  return array.slice(skipIndex);
}

export default skipWhile;
