/**
 * Partitions array into two arrays based on predicate.
 *
 * PURPOSE: Splits data into passing/failing groups for validation,
 * filtering active/inactive items, or separating successful/failed results.
 *
 * @param {Array} array - Array to partition
 * @param {Function} predicate - Function returning boolean
 * @returns {Array} [passing, failing] tuple
 */
function partition(array, predicate) {
  if (!Array.isArray(array)) return [[], []];
  
  const pass = [];
  const fail = [];
  
  for (const item of array) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  
  return [pass, fail];
}

module.exports = partition;
