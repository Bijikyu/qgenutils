/**
 * Finds difference between arrays (items in first not in others).
 *
 * PURPOSE: Identifies unique elements for delta calculations,
 * finding new additions, or filtering out excluded items.
 *
 * @param {Array} array - Source array
 * @param {...Array} excludeArrays - Arrays of items to exclude
 * @returns {Array} Items in first array not in any exclude array
 */
function difference(array, ...excludeArrays) {
  if (!Array.isArray(array)) return [];
  
  const excludeSet = new Set(excludeArrays.flat());
  return array.filter(item => !excludeSet.has(item));
}

module.exports = difference;
