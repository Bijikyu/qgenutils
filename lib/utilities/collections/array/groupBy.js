/**
 * Groups array elements by a key function.
 *
 * PURPOSE: Organizes data by category for reporting, aggregation,
 * and hierarchical display. Common for grouping transactions by date,
 * users by role, or items by status.
 *
 * @param {Array} array - Array to group
 * @param {Function} keyFn - Function to extract group key from item
 * @returns {object} Object with keys mapping to arrays of items
 */
function groupBy(array, keyFn) {
  if (!Array.isArray(array)) return {};
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
  }, {});
}

module.exports = groupBy;
