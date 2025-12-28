/**
 * Array Utilities Module Export
 * 
 * PURPOSE: Provides centralized access to all array manipulation utilities
 * in the collections module. This barrel export makes it easier to import
 * multiple array utilities while maintaining tree-shaking support.
 * 
 * UTILITIES INCLUDED:
 * - groupBy: Group array elements by key function
 * - partition: Split array into two groups based on predicate
 * - unique: Remove duplicate elements with optional key function
 * - chunk: Split array into smaller chunks
 * - flatten: Flatten nested arrays
 * - intersection: Find common elements between arrays
 * - difference: Find elements in one array but not another
 * - sortBy: Sort array by key function or comparator
 * - shuffle: Randomly shuffle array elements
 * - take: Take first N elements from array
 * - takeWhile: Take elements while predicate is true
 * - skip: Skip first N elements from array
 * - skipWhile: Skip elements while predicate is true
 */

import groupBy from './groupBy';
import partition from './partition';
import unique from './unique';
import chunk from './chunk';
import flatten from './flatten';
import intersection from './intersection';
import difference from './difference';
import sortBy from './sortBy';
import shuffle from './shuffle';
import take from './take';
import takeWhile from './takeWhile';
import skip from './skip';
import skipWhile from './skipWhile';

// Named exports for better tree-shaking support
export {
  groupBy,
  partition,
  unique,
  chunk,
  flatten,
  intersection,
  difference,
  sortBy,
  shuffle,
  take,
  takeWhile,
  skip,
  skipWhile
};

// Default export for convenience (backward compatibility)
export default {
  groupBy,
  partition,
  unique,
  chunk,
  flatten,
  intersection,
  difference,
  sortBy,
  shuffle,
  take,
  takeWhile,
  skip,
  skipWhile
};
