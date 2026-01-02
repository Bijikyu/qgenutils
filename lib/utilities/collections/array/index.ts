/**
 * Array Utilities Module Export
 * 
 * PURPOSE: Provides centralized access to all array manipulation utilities
 * using lodash for battle-tested implementations. This barrel export makes it 
 * easier to import multiple array utilities while maintaining tree-shaking support.
 * 
 * MIGRATION NOTE: These utilities now use lodash implementations with enhanced
 * error handling and type safety for better maintenance and performance.
 * 
 * UTILITIES INCLUDED (from lodash):
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

import { qerrors } from 'qerrors';
import * as _ from 'lodash';

// Extract lodash functions with proper typing
const _groupBy = _.groupBy;
const _partition = _.partition;
const _uniq = _.uniq;
const _uniqWith = _.uniqWith;
const _chunk = _.chunk;
const _flatten = _.flatten;
const _intersection = _.intersection;
const _difference = _.difference;
const _sortBy = _.sortBy;
const _shuffle = _.shuffle;
const _take = _.take;
const _takeWhile = _.takeWhile;
const _skip = _.drop;
const _skipWhile = _.dropWhile;

// Wrapper functions with error handling and type safety
const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  try {
    if (!Array.isArray(array)) {
      throw new Error('groupBy requires an array');
    }
    if (typeof keyFn !== 'function') {
      throw new Error('groupBy requires a key function');
    }
    return _groupBy(array, keyFn) as Record<K, T[]>;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'groupBy', `Array grouping failed for array length: ${array?.length}`);
    return {} as Record<K, T[]>;
  }
};

const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  try {
    if (!Array.isArray(array)) {
      throw new Error('partition requires an array');
    }
    if (typeof predicate !== 'function') {
      throw new Error('partition requires a predicate function');
    }
    return _partition(array, predicate);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'partition', `Array partitioning failed for array length: ${array?.length}`);
    return [[], []];
  }
};

const unique = <T>(array: T[], keyFn?: (item: T) => any): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    
    if (keyFn) {
      return _uniqWith(array, (a, b) => keyFn(a) === keyFn(b));
    }
    
    return _uniq(array);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'unique', `Array deduplication failed for array length: ${array?.length}`);
    return [];
  }
};

const chunk = <T>(array: T[], size: number): T[][] => {
  try {
    if (!Array.isArray(array)) return [];
    if (size <= 0) {
      throw new Error('Chunk size must be greater than 0');
    }
    return _chunk(array, size);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'chunk', `Array chunking failed for array length: ${array?.length}, chunk size: ${size}`);
    return [];
  }
};

const flatten = <T>(array: any[]): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    return _flatten(array) as T[];
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'flatten', `Array flattening failed for array length: ${array?.length}`);
    return [];
  }
};

const intersection = <T>(...arrays: T[][]): T[] => {
  try {
    if (arrays.some(arr => !Array.isArray(arr))) return [];
    return _intersection(...arrays);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'intersection', `Array intersection failed for ${arrays.length} arrays`);
    return [];
  }
};

const difference = <T>(array: T[], ...values: T[][]): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    if (values.some(arr => !Array.isArray(arr))) return [];
    return _difference(array, ...values);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'difference', `Array difference failed for array length: ${array?.length}`);
    return [];
  }
};

const sortBy = <T>(array: T[], ...iteratees: Array<(item: T) => any>): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    if (iteratees.some(iter => typeof iter !== 'function')) {
      throw new Error('sortBy requires valid iteratee functions');
    }
    return _sortBy(array, ...iteratees);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'sortBy', `Array sorting failed for array length: ${array?.length}`);
    return [];
  }
};

const shuffle = <T>(array: T[]): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    return _shuffle(array);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'shuffle', `Array shuffling failed for array length: ${array?.length}`);
    return [];
  }
};

const take = <T>(array: T[], n: number): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    if (n < 0) {
      throw new Error('take requires a non-negative number');
    }
    return _take(array, n);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'take', `Array take failed for array length: ${array?.length}, n: ${n}`);
    return [];
  }
};

const takeWhile = <T>(array: T[], predicate: (item: T) => boolean): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    if (typeof predicate !== 'function') {
      throw new Error('takeWhile requires a predicate function');
    }
    return _takeWhile(array, predicate);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'takeWhile', `Array takeWhile failed for array length: ${array?.length}`);
    return [];
  }
};

const skip = <T>(array: T[], n: number): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    if (n < 0) {
      throw new Error('skip requires a non-negative number');
    }
    return _skip(array, n);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'skip', `Array skip failed for array length: ${array?.length}, n: ${n}`);
    return [];
  }
};

const skipWhile = <T>(array: T[], predicate: (item: T) => boolean): T[] => {
  try {
    if (!Array.isArray(array)) return [];
    if (typeof predicate !== 'function') {
      throw new Error('skipWhile requires a predicate function');
    }
    return _skipWhile(array, predicate);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'skipWhile', `Array skipWhile failed for array length: ${array?.length}`);
    return [];
  }
};

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
