/**
 * Finds intersection of multiple arrays.
 *
 * PURPOSE: Identifies common elements across datasets for
 * permission checking, feature comparison, or data reconciliation.
 *
 * PERFORMANCE: Optimized to O(n + m) using Set data structure
 * instead of O(n*m) nested loops with includes() calls.
 *
 * @param {...Array} arrays - Arrays to intersect
 * @returns {Array} Elements present in all arrays
 */
function intersection(...arrays) {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0] ? [...arrays[0]] : [];
  
  const [first, ...rest] = arrays;
  if (!Array.isArray(first)) return [];
  
  // Create Set from first array for O(1) lookups
  const intersectionSet = new Set(first);
  
  // Filter through each remaining array, removing non-matching elements
  for (const arr of rest) {
    if (!Array.isArray(arr)) {
      // If any array is invalid, return empty intersection
      return [];
    }
    
    // Create Set from current array for efficient lookup
    const currentSet = new Set(arr);
    
    // Keep only elements that exist in both sets
    for (const item of intersectionSet) {
      if (!currentSet.has(item)) {
        intersectionSet.delete(item);
      }
    }
    
    // Early exit if intersection becomes empty
    if (intersectionSet.size === 0) {
      return [];
    }
  }
  
  return Array.from(intersectionSet);
}

export default intersection;
