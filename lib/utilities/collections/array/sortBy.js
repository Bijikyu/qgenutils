/**
 * Sorts array by multiple criteria functions.
 *
 * PURPOSE: Multi-level sorting for complex data ordering,
 * such as sorting by date then by name, or priority then status.
 *
 * @param {Array} array - Array to sort
 * @param {...Function} criteria - Functions extracting sort values
 * @returns {Array} New sorted array (does not mutate original)
 */
function sortBy(array, ...criteria) {
  if (!Array.isArray(array)) return [];
  if (criteria.length === 0) return [...array];
  
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      const aVal = criterion(a);
      const bVal = criterion(b);
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

module.exports = sortBy;
