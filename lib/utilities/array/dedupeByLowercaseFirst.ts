/**
 * Generic array deduplication preserving first occurrence based on lowercase keys
 *
 * @description
 * Highly reusable utility for deduplicating arrays of objects while preserving
 * original casing and provenance of first occurrence. Uses Map-based approach
 * for O(n) performance, making it suitable for large datasets.
 *
 * @purpose
 * - Data processing pipelines where duplicate records need removal
 * - API response normalization before client consumption
 * - UI state management where duplicates cause rendering issues
 * - Database result cleanup before caching
 *
 * @common-use-cases
 * - Removing duplicate user records from API responses
 * - Deduplicating product listings from multiple sources
 * - Cleaning up form submissions with repeated entries
 * - Normalizing configuration arrays from multiple files
 *
 * @edge-case-handling
 * - Null/undefined keys: silently skipped to prevent errors
 * - Empty strings: ignored as invalid identifiers
 * - Whitespace-only strings: trimmed to empty and skipped
 * - Non-string keys: converted to strings before processing
 *
 * @performance-characteristics
 * - Time Complexity: O(n) where n is array length
 * - Space Complexity: O(k) where k is number of unique keys
 * - Preserves input order for first occurrences
 * - Memory efficient with Map data structure
 *
 * @param {T[]} items - Array of items to deduplicate
 * @param {(item: T) => K} keyOf - Function to extract comparison key from each item
 * @returns {T[]} Deduplicated array preserving first occurrences
 * @throws {TypeError} When items is not iterable or keyOf is not a function
 *
 * @example
 * ```javascript
 * const users = [
 *   { id: 1, email: 'John@example.com' },
 *   { id: 2, email: 'JOHN@EXAMPLE.COM' },
 *   { id: 3, email: 'jane@example.com' }
 * ];
 *
 * const deduped = dedupeByLowercaseFirst(users, user => user.email);
 * // Result: [{ id: 1, email: 'John@example.com' }, { id: 3, email: 'jane@example.com' }]
 * ```
 *
 * @since 1.0.0
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 * @author QGenUtils Team
 */

const dedupeByLowercaseFirst = <T, K extends string>(
  items: T[],
  keyOf: (item: T) => K
): T[] => {
  // Input validation for robustness
  if (!Array.isArray(items)) {
    throw new TypeError(`Expected array for items parameter, got ${typeof items}`);
  }

  if (typeof keyOf !== 'function') {
    throw new TypeError(`Expected function for keyOf parameter, got ${typeof keyOf}`);
  }

  const seen = new Map<string, T>();

  for (const item of items) {
    const keyValue = keyOf(item);
    const raw = String(keyValue ?? '').trim();
    if (!raw) {
      continue;
    }

    const key = raw.toLowerCase();
    !seen.has(key) && seen.set(key, item);
  }

  return Array.from(seen.values());
};

export default dedupeByLowercaseFirst;
