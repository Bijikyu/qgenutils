/**
 * Groups array elements by a key function.
 *
 * PURPOSE: Organizes data by category for reporting, aggregation,
 * and hierarchical display. Common for grouping transactions by date,
 * users by role, or items by status.
 *
 * @param array - Array to group
 * @param keyFn - Function to extract group key from item
 * @returns Object with keys mapping to arrays of items
 */
const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  if (!Array.isArray(array)) {
    throw new Error('groupBy requires an array');
  }
  
  if (typeof keyFn !== 'function') {
    throw new Error('groupBy requires a key function');
  }

  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export default groupBy;