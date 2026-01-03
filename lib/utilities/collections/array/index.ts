/**
 * Array Utilities Module Export - Final Fixed Version
 */

import { qerrors } from 'qerrors';

import {
  groupBy,
  unique,
  chunk,
  flatten,
  pick,
  omit,
  deepClone
} from './nativeArrayUtils.js';

const _ = require('lodash');

// High-frequency operations use native implementations
const groupByFn = groupBy;
const uniqueFn = unique;
const chunkFn = chunk;
const flattenFn = flatten;
const pickFn = pick;
const omitFn = omit;
const deepCloneFn = deepClone;

// Lodash implementations for complex operations
const partitionFn = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  try {
    if (!Array.isArray(array)) {
      throw new Error('partition requires an array');
    }
    if (typeof predicate !== 'function') {
      throw new Error('partition requires a predicate function');
    }
    return _.partition(array, predicate);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'partition', `Array partitioning failed for array length: ${array?.length}`);
    return [[], []];
  }
};

const intersectionFn = <T>(...arrays: T[][]): T[] => {
  try {
    if (arrays.some(arr => !Array.isArray(arr))) {
      return [];
    }
    return _.intersection(...arrays);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'intersection', `Array intersection failed for ${arrays.length} arrays`);
    return [];
  }
};

const differenceFn = <T>(array: T[], ...values: T[][]): T[] => {
  try {
    if (!Array.isArray(array)) {
      return [];
    }
    if (values.some(arr => !Array.isArray(arr))) {
      return [];
    }
    return _.difference(array, ...values);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'difference', `Array difference failed`);
    return [];
  }
};

const sortByFn = <T>(array: T[], ...iteratees: Array<(item: T) => any>): T[] => {
  try {
    if (!Array.isArray(array)) {
      return [];
    }
    return _.sortBy(array, ...iteratees);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'sortBy', `Array sorting failed for array length: ${array?.length}`);
    return [];
  }
};

const shuffleFn = <T>(array: T[]): T[] => {
  try {
    if (!Array.isArray(array)) {
      return [];
    }
    return _.shuffle(array);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'shuffle', `Array shuffling failed for array length: ${array?.length}`);
    return [];
  }
};

const takeFn = <T>(array: T[], n: number): T[] => {
  try {
    if (!Array.isArray(array)) {
      return [];
    }
    return _.take(array, n);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'take', `Array take failed for array length: ${array?.length}, n: ${n}`);
    return [];
  }
};

const takeWhileFn = <T>(array: T[], predicate: (item: T) => boolean): T[] => {
  try {
    if (!Array.isArray(array)) {
      return [];
    }
    if (typeof predicate !== 'function') {
      throw new Error('takeWhile requires a predicate function');
    }
    return _.takeWhile(array, predicate);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'takeWhile', `Array takeWhile failed for array length: ${array?.length}`);
    return [];
  }
};

const skipFn = <T>(array: T[], n: number): T[] => {
  try {
    if (!Array.isArray(array)) {
      return [];
    }
    return _.drop(array, n);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'skip', `Array skip failed for array length: ${array?.length}, n: ${n}`);
    return [];
  }
};

// Simple wrapper functions with proper naming
const groupBy = <T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<string, T[]> => {
  try {
    return groupByFn(array, keyFn);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'groupBy', `Array grouping failed for array length: ${array?.length}`);
    return {} as Record<string, T[]>;
  }
};

const unique = <T>(array: T[]): T[] => {
  try {
    return uniqueFn(array) as T[];
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'unique', `Array deduplication failed for array length: ${array?.length}`);
    return [];
  }
};

const chunk = <T>(array: T[], size: number): T[][] => {
  try {
    if (!Array.isArray(array)) {
      return [];
    }
    if (size <= 0) {
      throw new Error('Chunk size must be greater than 0');
    }
    return chunkFn(array, size) as T[][];
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'chunk', `Array chunking failed for array length: ${array?.length}, chunk size: ${size}`);
    return [];
  }
};

const flatten = <T>(array: any[]): T[] => {
  try {
    return flattenFn(array) as T[];
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'flatten', `Array flattening failed for array length: ${array?.length}`);
    return [];
  }
};

const pick = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  try {
    if (!obj || typeof obj !== 'object') {
      return {} as Pick<T, K>;
    }
    if (!Array.isArray(keys)) {
      return {} as Pick<T, K>;
    }
    return pickFn(obj, keys) as Pick<T, K>;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'pick', `Object property selection failed for keys: ${keys?.join(', ')}`);
    return {} as Pick<T, K>;
  }
};

const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  try {
    if (!obj || typeof obj !== 'object') {
      return {} as Omit<T, K>;
    }
    if (!Array.isArray(keys)) {
      return {} as Omit<T, K>;
    }
    return omitFn(obj, keys) as Omit<T, K>;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'omit', `Object property removal failed for keys: ${keys?.join(', ')}`);
    return {} as Omit<T, K>;
  }
};

const deepClone = <T>(obj: T): T => {
  try {
    return deepCloneFn(obj) as T;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'deepClone', `Deep cloning failed for object type: ${typeof obj}`);
    return null as T;
  }
};

// Remaining complex functions
const partition = partitionFn;
const intersection = intersectionFn;
const difference = differenceFn;
const sortBy = sortByFn;
const shuffle = shuffleFn;
const take = takeFn;
const takeWhile = takeWhileFn;
const skip = skipFn;

// Named exports for tree-shaking
export {
  groupBy,
  partition,
  unique,
  chunk,
  flatten,
  pick,
  omit,
  deepClone,
  groupBy: groupByFn,
  partition,
  unique: uniqueFn,
  chunk: chunkFn,
  flatten: flattenFn,
  pick: pickFn,
  omit: omitFn,
  deepClone: deepCloneFn,
  intersection,
  difference,
  sortBy,
  shuffle,
  take,
  takeWhile,
  skip,
  uniqueWith: uniqueFn,
  uniqWith: uniqueFn
};

// Default export for backward compatibility
export default {
  groupBy: groupByFn,
  partition,
  unique: uniqueFn,
  chunk: chunkFn,
  flatten: flattenFn,
  pick: pickFn,
  omit: omitFn,
  deepClone: deepCloneFn
};