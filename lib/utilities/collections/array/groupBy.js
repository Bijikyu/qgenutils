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
const groupBy = (array, keyFn) => (!Array.isArray(array) || typeof keyFn !== 'function') ? (typeof keyFn !== 'function' ? (() => { throw new Error('groupBy requires a key function'); })() : {}) : array.reduce((groups, item) => {
  const key = keyFn(item);
  !groups[key] && (groups[key] = []);
  groups[key].push(item);
  return groups;
}, {});

module.exports = groupBy;
