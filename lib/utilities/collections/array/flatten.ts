/**
 * Flattens nested arrays recursively.
 *
 * PURPOSE: Normalizes deeply nested data structures for processing,
 * useful after mapping operations that produce nested results.
 *
 * @param {Array} array - Array with potential nesting
 * @returns {Array} Flattened array
 */
function flatten(array) {
  if (!Array.isArray(array)) return [];
  
  return array.reduce((flat, item) => 
    flat.concat(Array.isArray(item) ? flatten(item) : item),
    []
  );
}

export default flatten;
