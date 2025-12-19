/**
 * Finds intersection of multiple arrays.
 *
 * PURPOSE: Identifies common elements across datasets for
 * permission checking, feature comparison, or data reconciliation.
 *
 * @param {...Array} arrays - Arrays to intersect
 * @returns {Array} Elements present in all arrays
 */
function intersection(...arrays) {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0] ? [...arrays[0]] : [];
  
  const [first, ...rest] = arrays;
  if (!Array.isArray(first)) return [];
  
  return first.filter(item => 
    rest.every(arr => Array.isArray(arr) && arr.includes(item))
  );
}

export default intersection;
