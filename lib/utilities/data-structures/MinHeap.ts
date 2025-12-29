import Heap from 'heap';

/**
 * Min-Heap Factory Function - High-Performance Priority Queue Implementation
 * 
 * PURPOSE: Creates a min-heap data structure that provides O(log n) time complexity
 * for insertion and extraction operations. This is essential for priority queues,
 * task scheduling, and algorithms that require efficient access to the minimum element.
 * 
 * ARCHITECTURE: Uses the battle-tested 'heap' npm package as the underlying
 * implementation while providing a clean, consistent API that matches common
 * JavaScript patterns. This wrapper approach ensures reliability while maintaining
 * interface consistency across the utility library.
 * 
 * PERFORMANCE CHARACTERISTICS:
 * - push(): O(log n) - Insertion with heap property maintenance
 * - pop(): O(log n) - Extraction of minimum element with heap reorganization
 * - peek(): O(1) - Access to minimum element without removal
 * - size(): O(1) - Current heap size
 * - clear(): O(1) - Efficient heap reset
 * 
 * COMPARATOR FUNCTION: The compare function determines the heap ordering:
 * - Return negative number if a should come before b (a < b)
 * - Return positive number if a should come after b (a > b)
 * - Return zero if a and b are considered equal
 * 
 * @param {Function} compare - Comparator function (a, b) => number that defines ordering
 * @returns {Object} MinHeap instance with standard priority queue operations
 * @throws {Error} If compare function is not provided or is not a function
 * 
 * @example
 * // Priority queue for tasks
 * const taskHeap = createMinHeap((a, b) => a.priority - b.priority);
 * taskHeap.push({ id: 1, priority: 5, task: 'cleanup' });
 * taskHeap.push({ id: 2, priority: 1, task: 'urgent' });
 * const nextTask = taskHeap.pop(); // Returns { id: 2, priority: 1, task: 'urgent' }
 * 
 * @example
 * // Min-heap for numbers
 * const numberHeap = createMinHeap((a, b) => a - b);
 * numberHeap.push(5);
 * numberHeap.push(2);
 * numberHeap.push(8);
 * const min = numberHeap.pop(); // Returns 2
 */
function createMinHeap(compare: (a: any, b: any) => number) {
  // Validate comparator function to prevent runtime errors
  if (typeof compare !== 'function') {
    throw new Error('Compare function is required and must be a function');
  }

  // Create heap instance with the provided comparator using the underlying heap library
  const heap = new Heap(compare);

  // Return a clean interface that abstracts the underlying implementation
  // This provides consistency and allows for future implementation changes
  return {
    /**
     * Insert an item into the heap while maintaining heap properties
     * @param {*} item - Item to insert (any type supported by comparator)
     */
    push(item: any) {
      heap.push(item);
    },

    /**
     * Remove and return the minimum item from the heap
     * @returns {*} Minimum item or undefined if heap is empty
     */
    pop() {
      return heap.pop();
    },

    /**
     * View the minimum item without removing it from the heap
     * @returns {*} Minimum item or undefined if heap is empty
     */
    peek() {
      return heap.peek();
    },

    /**
     * Get the current number of items in the heap
     * @returns {number} Current heap size
     */
    size() {
      return heap.size();
    },

    /**
     * Remove all items from the heap efficiently
     */
    clear() {
      heap.clear();
    },

    /**
     * Convert heap to array representation (not sorted)
     * @returns {Array} Array representation of heap's internal storage
     */
    toArray() {
      return heap.toArray();
    }
  };
}

export default createMinHeap;
