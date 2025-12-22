import Heap from 'heap';

/**
 * Min-Heap implementation using the heap npm module
 * Provides O(log n) priority queue operations with enhanced performance and battle-tested reliability
 * @param {Function} compare - Comparator function (a, b) => number (negative if a < b)
 * @returns {Object} MinHeap instance with push, pop, peek, size, clear methods
 * @example
 * const heap: any = createMinHeap((a, b) => a.priority - b.priority);
 * heap.push({ priority: 5 });
 * heap.push({ priority: 1 });
 * heap.pop(); // { priority: 1 }
 */
function createMinHeap(compare: (a: any, b: any) => number) {
  if (typeof compare !== 'function') {
    throw new Error('Compare function is required');
  }

  // Create heap instance with the provided comparator
  const heap = new Heap(compare);

  // Return interface that matches the original API
  return {
    push(item: any) {
      heap.push(item);
    },

    pop() {
      return heap.pop();
    },

    peek() {
      return heap.peek();
    },

    size() {
      return heap.size();
    },

    clear() {
      heap.clear();
    },

    toArray() {
      return heap.toArray();
    }
  };
}

export default createMinHeap;
