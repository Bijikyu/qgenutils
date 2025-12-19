/**
 * Generic array deduplication preserving first occurrence based on lowercase keys.
 *
 * PURPOSE: Highly reusable utility for deduplicating arrays of objects while
 * preserving the original casing and provenance of the first occurrence.
 * Uses Map-based approach for O(n) performance.
 *
 * COMMON USE CASES:
 * - Data processing pipelines
 * - API response normalization
 * - UI state management where duplicates need removal
 *
 * EDGE CASE HANDLING:
 * - Null/undefined keys: skipped
 * - Empty strings: skipped
 * - Whitespace-only: skipped (trimmed to empty)
 *
 * @param {Array} items - Array of items to deduplicate
 * @param {function} keyOf - Function to extract string key from each item
 * @returns {Array} Deduplicated array preserving first occurrences
 */

const dedupeByLowercaseFirst = (items, keyOf) => (!Array.isArray(items) || typeof keyOf !== 'function') ? [] : (() => {
  const seen = new Map();
  for (const item of items) {
    const raw = (keyOf(item) ?? '').trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    !seen.has(key) && seen.set(key, item);
  }
  return Array.from(seen.values());
})();

module.exports = dedupeByLowercaseFirst;
