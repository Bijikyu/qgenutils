import { qerrors } from 'qerrors';

/**
 * Array Deduplication Utility - Unique Elements Extraction
 * 
 * PURPOSE: Provides efficient removal of duplicate elements from arrays with
 * support for both simple value deduplication and complex object deduplication
 * using customizable key extraction. Essential for data cleaning, validation,
 * and preprocessing before database operations or display.
 * 
 * IMPLEMENTATION STRATEGIES:
 * - Simple Values: Uses native Set for optimal O(n) performance with primitives
 * - Complex Objects: Uses Set with key function for property-based deduplication  
 * - Memory Efficient: Single-pass algorithms minimize memory overhead
 * - Type Agnostic: Works with any data type that can be compared
 * 
 * PERFORMANCE CHARACTERISTICS:
 * - Without keyFn: O(n) time complexity using Set insertion
 * - With keyFn: O(n) time complexity with single pass and Set lookup
 * - Memory: O(k) where k is number of unique elements
 * - Native Set: Leverages V8 optimized Set operations for better performance
 * 
 * DEDUPLICATION SCENARIOS:
 * - Primitive Arrays: [1, 2, 2, 3] → [1, 2, 3]
 * - String Arrays: ['a', 'b', 'a', 'c'] → ['a', 'b', 'c']
 * - Object Arrays: [{id:1}, {id:2}, {id:1}] with keyFn(item=>item.id)
 * - Mixed Data: Handles heterogeneous arrays with consistent key extraction
 * 
 * KEY FUNCTION ADVANTAGES:
 * - Property-Based: Deduplicate by specific object properties
 * - Computed Keys: Support for complex comparison logic
 * - Performance: Key extraction happens once per element
 * - Flexibility: Supports custom deduplication criteria
 * - Type Safety: Maintains original object types and structure
 * 
 * USE CASES:
 * - Data preprocessing before API requests or database saves
 * - Removing duplicate user selections in UI components
 * - Filtering duplicate entries from external API responses
 * - Preparing unique datasets for reporting and analytics
 * - Cleaning form data before validation or storage
 * - Removing duplicate log entries or error messages
 * 
 * ERROR HANDLING STRATEGY:
 * - Graceful Degradation: Returns empty array for invalid inputs
 * - Non-Array Safety: Handles non-array inputs without throwing
 * - Key Function Protection: Catches errors in custom key functions
 * - Comprehensive Logging: Debug information for troubleshooting
 * 
 * @param {any[]} array - Array to deduplicate (any type, primitives or objects)
 * @param {(item: any) => any} [keyFn] - Optional function to extract comparison key
 *                                   from each element for object deduplication.
 *                                   If omitted, uses direct element comparison.
 * @returns {any[]} Array with duplicate elements removed, preserving first occurrence order.
 *                   Returns empty array for invalid inputs.
 * 
 * @example
 * // Simple primitive deduplication
 * const numbers = [1, 2, 2, 3, 1, 4];
 * const uniqueNumbers = unique(numbers); // [1, 2, 3, 4]
 * 
 * @example
 * // String deduplication with case sensitivity
 * const fruits = ['apple', 'banana', 'Apple', 'orange', 'banana'];
 * const uniqueFruits = unique(fruits); // ['apple', 'banana', 'Apple', 'orange']
 * 
 * @example
 * // Object deduplication by ID property
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 1, name: 'Alice Updated' }, // Duplicate ID
 *   { id: 3, name: 'Charlie' }
 * ];
 * const uniqueUsers = unique(users, user => user.id);
 * // Result: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }]
 * 
 * @example
 * // Complex key extraction - deduplication by composite key
 * const orders = [
 *   { customerId: 1, productId: 'A', date: '2023-01-01' },
 *   { customerId: 1, productId: 'A', date: '2023-01-01' }, // Duplicate
 *   { customerId: 1, productId: 'B', date: '2023-01-01' },
 *   { customerId: 2, productId: 'A', date: '2023-01-02' }
 * ];
 * const uniqueOrders = unique(orders, order => `${order.customerId}_${order.productId}_${order.date}`);
 * // Result: First, third, and fourth orders only
 * 
 * @example
 * // Deduplication for form data cleaning
 * const selectedTags = ['javascript', 'typescript', 'javascript', 'react', 'typescript'];
 * const cleanTags = unique(selectedTags); // ['javascript', 'typescript', 'react']
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
