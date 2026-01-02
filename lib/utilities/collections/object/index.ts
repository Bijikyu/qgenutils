/**
 * Object Utilities Module Export
 * 
 * PURPOSE: Provides centralized access to all object manipulation utilities
 * in collections module. This barrel export makes it easier to import
 * multiple object utilities while maintaining tree-shaking support.
 * 
 * MIGRATION NOTE: Selective migration to lodash for basic operations while
 * maintaining custom implementations for security-critical functions with
 * enhanced features like prototype pollution protection and circular reference detection.
 * 
 * UTILITIES INCLUDED:
 * - isPlainObject: Check if value is plain object (kept - custom implementation)
 * - pick: Extract specific properties from object (migrated to lodash)
 * - omit: Remove specific properties from object (migrated to lodash)
 * - deepMerge: Recursively merge multiple objects (kept - enhanced security)
 * - deepClone: Create deep copy of object (kept - circular reference detection)
 * - getNestedValue: Get nested property value safely (migrated to lodash)
 * - setNestedValue: Set nested property value safely (kept custom)
 * - isEqual: Deep equality comparison of objects (migrated to lodash)
 * - mapKeys: Transform object keys (migrated to lodash)
 * - mapValues: Transform object values (migrated to lodash)
 * - filterKeys: Filter object properties by predicate (migrated to lodash)
 * - isEmpty: Check if object is empty (migrated to lodash)
 * - toQueryString: Convert object to query string (kept custom - URL handling)
 * - fromQueryString: Parse query string to object (kept custom - URL handling)
 */

import { qerrors } from 'qerrors';
import * as _ from 'lodash';

// Extract lodash functions with proper typing
const _pick = _.pick;
const _omit = _.omit;
const _get = _.get;
const _isEqual = _.isEqual;
const _mapKeys = _.mapKeys;
const _mapValues = _.mapValues;
const _pickBy = _.pickBy;
const _isEmpty = _.isEmpty;

// Keep custom implementations for security-critical functions
import isPlainObject from './isPlainObject';
import deepMerge from './deepMerge';
import deepClone from './deepClone';
import setNestedValue from './setNestedValue';
import toQueryString from './toQueryString';
import fromQueryString from './fromQueryString';

// Wrapper functions for lodash utilities with error handling
const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  try {
    if (!obj || typeof obj !== 'object' || !Array.isArray(keys)) {
      return {} as Pick<T, K>;
    }
    return _pick(obj, keys) as Pick<T, K>;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'pick', `Object property selection failed`);
    return {} as Pick<T, K>;
  }
};

const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  try {
    if (!obj || typeof obj !== 'object' || !Array.isArray(keys)) {
      return {} as Omit<T, K>;
    }
    return _omit(obj, keys) as Omit<T, K>;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'omit', `Object property removal failed`);
    return {} as Omit<T, K>;
  }
};

const getNestedValue = <T>(obj: any, path: string, defaultValue?: T): T => {
  try {
    if (!obj || typeof obj !== 'object') {
      return defaultValue !== undefined ? defaultValue : undefined as T;
    }
    return _get(obj, path, defaultValue);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'getNestedValue', `Nested property access failed for path: ${path}`);
    return defaultValue !== undefined ? defaultValue : undefined as T;
  }
};

const isEqual = <T>(value: T, other: T): boolean => {
  try {
    return _isEqual(value, other);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'isEqual', `Deep equality comparison failed`);
    return false;
  }
};

const mapKeys = <T, K extends string | number>(
  obj: Record<string, T>,
  keyFn: (value: T, key: string) => K
): Record<K, T> => {
  try {
    if (!obj || typeof obj !== 'object' || typeof keyFn !== 'function') {
      return {} as Record<K, T>;
    }
    return _mapKeys(obj, keyFn) as Record<K, T>;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'mapKeys', `Object key transformation failed`);
    return {} as Record<K, T>;
  }
};

const mapValues = <T, U>(
  obj: Record<string, T>,
  valueFn: (value: T, key: string) => U
): Record<string, U> => {
  try {
    if (!obj || typeof obj !== 'object' || typeof valueFn !== 'function') {
      return {};
    }
    return _mapValues(obj, valueFn);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'mapValues', `Object value transformation failed`);
    return {};
  }
};

const filterKeys = <T>(
  obj: Record<string, T>,
  predicate: (value: T, key: string) => boolean
): Record<string, T> => {
  try {
    if (!obj || typeof obj !== 'object' || typeof predicate !== 'function') {
      return {};
    }
    return _pickBy(obj, predicate);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'filterKeys', `Object key filtering failed`);
    return {};
  }
};

const isEmpty = (value: any): boolean => {
  try {
    return _isEmpty(value);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'isEmpty', `Empty check failed`);
    return true;
  }
};

// Named exports for better tree-shaking support
export {
  isPlainObject,
  pick,
  omit,
  deepMerge,
  deepClone,
  getNestedValue,
  setNestedValue,
  isEqual,
  mapKeys,
  mapValues,
  filterKeys,
  isEmpty,
  toQueryString,
  fromQueryString
};

// Default export for convenience (backward compatibility)
export default {
  isPlainObject,
  pick,
  omit,
  deepMerge,
  deepClone,
  getNestedValue,
  setNestedValue,
  isEqual,
  mapKeys,
  mapValues,
  filterKeys,
  isEmpty,
  toQueryString,
  fromQueryString
};
