/**
 * Returns unique array elements using optional key function.
 *
 * PURPOSE: Deduplicates data for display, validation, or before
 * database inserts. Key function enables deduplication by property.
 *
 * @param {Array} array - Array to deduplicate
 * @param {Function} [keyFn] - Optional function to extract comparison key
 * @returns {Array} Array with unique elements
 */
function unique(array, keyFn) {
  if (!Array.isArray(array)) return [];
  
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen: any = new Set();
  return array.filter(item => {
    const key: any = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export default unique;
