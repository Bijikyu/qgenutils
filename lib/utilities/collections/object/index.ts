/**
 * Object Utilities Module Export
 * 
 * PURPOSE: Provides centralized access to all object manipulation utilities
 * in the collections module. This barrel export makes it easier to import
 * multiple object utilities while maintaining tree-shaking support.
 * 
 * UTILITIES INCLUDED:
 * - isPlainObject: Check if value is plain object
 * - pick: Extract specific properties from object
 * - omit: Remove specific properties from object
 * - deepMerge: Recursively merge multiple objects
 * - deepClone: Create deep copy of object
 * - getNestedValue: Get nested property value safely
 * - setNestedValue: Set nested property value safely
 * - isEqual: Deep equality comparison of objects
 * - mapKeys: Transform object keys
 * - mapValues: Transform object values
 * - filterKeys: Filter object properties by predicate
 * - isEmpty: Check if object is empty
 * - toQueryString: Convert object to query string
 * - fromQueryString: Parse query string to object
 */

import isPlainObject from './isPlainObject';
import pick from './pick';
import omit from './omit';
import deepMerge from './deepMerge';
import deepClone from './deepClone';
import getNestedValue from './getNestedValue';
import setNestedValue from './setNestedValue';
import isEqual from './isEqual';
import mapKeys from './mapKeys';
import mapValues from './mapValues';
import filterKeys from './filterKeys';
import isEmpty from './isEmpty';
import toQueryString from './toQueryString';
import fromQueryString from './fromQueryString';

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
