'use strict';

/**
 * Min-Heap implementation for O(log n) priority queue operations
 * Useful for rate limiters, task schedulers, and priority-based data structures
 * @param {Function} compare - Comparator function (a, b) => number (negative if a < b)
 * @returns {Object} MinHeap instance with push, pop, peek, size, clear methods
 * @example
 * const heap = createMinHeap((a, b) => a.priority - b.priority);
 * heap.push({ priority: 5 });
 * heap.push({ priority: 1 });
 * heap.pop(); // { priority: 1 }
 */
function createMinHeap(compare) { // factory for min-heap instances
  if (typeof compare !== 'function') { // validate comparator
    throw new Error('Compare function is required');
  }

  const heap = []; // internal heap array

  function bubbleUp(index) { // move item up to maintain heap property
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2); // parent index formula
      if (compare(heap[parentIndex], heap[index]) <= 0) break; // parent is smaller, done
      [heap[parentIndex], heap[index]] = [heap[index], heap[parentIndex]]; // swap
      index = parentIndex; // continue with parent
    }
  }

  function bubbleDown(index) { // move item down to maintain heap property
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1; // left child index formula
      const rightChild = 2 * index + 2; // right child index formula

      if (leftChild < heap.length && compare(heap[leftChild], heap[minIndex]) < 0) {
        minIndex = leftChild; // left child is smaller
      }

      if (rightChild < heap.length && compare(heap[rightChild], heap[minIndex]) < 0) {
        minIndex = rightChild; // right child is smaller
      }

      if (minIndex === index) break; // current is smallest, done
      [heap[index], heap[minIndex]] = [heap[minIndex], heap[index]]; // swap
      index = minIndex; // continue with swapped position
    }
  }

  return {
    push(item) { // add item to heap - O(log n)
      heap.push(item);
      bubbleUp(heap.length - 1);
    },

    pop() { // remove and return minimum item - O(log n)
      if (heap.length === 0) return undefined;
      const top = heap[0]; // save minimum
      const last = heap.pop(); // remove last element
      if (heap.length > 0) {
        heap[0] = last; // move last to top
        bubbleDown(0); // restore heap property
      }
      return top;
    },

    peek() { // view minimum item without removing - O(1)
      return heap[0];
    },

    size() { // get current heap size - O(1)
      return heap.length;
    },

    clear() { // remove all items - O(1)
      heap.length = 0;
    },

    toArray() { // get copy of internal array (not heap-ordered) - O(n)
      return [...heap];
    }
  };
}

module.exports = createMinHeap;
