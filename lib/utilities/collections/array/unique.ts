import { qerrors } from 'qerrors';

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
function unique(array: any[], keyFn?: (item: any) => any): any[] {
  try {
  if (!Array.isArray(array)) return [];
  
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'unique', `Array deduplication failed for array length: ${array?.length}`);
    return [];
  }
}

export default unique;
