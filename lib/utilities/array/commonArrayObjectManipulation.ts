/**
 * Common Array and Object Manipulation Utilities
 *
 * Centralized array and object manipulation utilities to eliminate code duplication across
 * codebase. These utilities handle common patterns including
 * iteration, filtering, mapping, reducing, deep operations, and type checking.
 */

import { handleError } from '../error/commonErrorHandling.js';

/**
 * Array manipulation utilities
 */
export const ArrayUtils = {
  /**
   * Safely checks if a value is an array
   */
  isArray: (value: any): value is any[] => {
    return Array.isArray(value);
  },

  /**
   * Creates an array with specified size and fills with value
   */
  create: <T>(size: number, fillValue: T): T[] => {
    return Array(size).fill(fillValue);
  },

  /**
   * Gets first element of array safely
   */
  first: <T>(array: T[]): T | undefined => {
    return array[0];
  },

  /**
   * Gets last element of array safely
   */
  last: <T>(array: T[]): T | undefined => {
    return array[array.length - 1];
  },

  /**
   * Checks if array is empty
   */
  isEmpty: (array: any[]): boolean => {
    return !array || array.length === 0;
  },

  /**
   * Checks if array is not empty
   */
  isNotEmpty: (array: any[]): boolean => {
    return array && array.length > 0;
  },

  /**
   * Safely gets array length
   */
  length: (array: any): number => {
    return array ? array.length : 0;
  },

  /**
   * Clones array (shallow copy)
   */
  clone: <T>(array: T[]): T[] => {
    return array.slice(0);
  },

  /**
   * Chunks array into specified size
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Flattens nested arrays
   */
  flatten: <T>(array: any[]): T[] => {
    const result: T[] = [];
    const flatten = (arr: any[]): void => {
      for (const item of arr) {
        if (Array.isArray(item)) {
          flatten(item);
        } else if (item != null) {
          result.push(item);
        }
      }
    };
    flatten(array);
    return result;
  },

  /**
   * Removes duplicates from array
   */
  unique: <T>(array: T[]): T[] => {
    const seen = new Set();
    return array.filter(item => {
      const key = typeof item === 'object' ? JSON.stringify(item) : item;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  /**
   * Removes elements based on predicate
   */
  remove: <T>(array: T[], predicate: (item: T, index: number) => boolean): T[] => {
    return array.filter((item, index) => !predicate(item, index));
  },

  /**
   * Filters array based on predicate
   */
  filter: <T>(array: T[], predicate: (item: T) => boolean): T[] => {
    return array.filter((item) => predicate(item));
  },

  /**
   * Maps array to different type
   */
  map: <T, U>(array: T[], mapper: (item: T, index: number) => U): U[] => {
    return array.map(mapper);
  },

  /**
   * Reduces array to single value
   */
  reduce: <T, U>(array: T[], reducer: (acc: U, item: T, index: number) => U, initialValue: U): U => {
    return array.reduce(reducer, initialValue);
  },

  /**
   * Joins array elements with separator
   */
  join: (array: any[], separator: string = ','): string => {
    return array.join(separator);
  },

  /**
   * Splits string into array by separator
   */
  split: (str: string, separator: string, limit?: number): string[] => {
    return limit ? str.split(separator, limit) : str.split(separator);
  },

  /**
   * Checks if array includes element
   */
  includes: <T>(array: T[], element: T): boolean => {
    return array.includes(element);
  }
};

/**
 * Object manipulation utilities
 */
export const ObjectUtils = {
  /**
   * Checks if value is an object
   */
  isObject: (value: any): value is object => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },

  /**
   * Gets all keys from object
   */
  keys: (obj: object): string[] => {
    return obj ? Object.keys(obj) : [];
  },

  /**
   * Gets all values from object
   */
  values: <T>(obj: Record<string, T>): T[] => {
    return obj ? Object.values(obj) : [];
  },

  /**
   * Gets all entries from object
   */
  entries: <T>(obj: Record<string, T>): Array<[string, T]> => {
    return obj ? Object.entries(obj) : [];
  },

  /**
   * Checks if object has property
   */
  has: (obj: object, key: string): boolean => {
    return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
  },

  /**
   * Gets property value safely
   */
  get: <T>(obj: object, key: string, defaultValue?: T): T | undefined => {
    return obj != null && obj.hasOwnProperty(key) ? (obj as any)[key] : defaultValue;
  },

  /**
   * Sets property value
   */
  set: <T>(obj: object, key: string, value: T): void => {
    if (obj != null) {
      (obj as any)[key] = value;
    }
  },

  /**
   * Deletes property from object
   */
  delete: (obj: object, key: string): void => {
    if (obj != null) {
      delete (obj as any)[key];
    }
  },

  /**
   * Merges objects (shallow)
   */
  merge: <T extends object>(target: T, source: Partial<T>): T => {
    return { ...target, ...source };
  },

  /**
   * Creates object from entries
   */
  fromEntries: <K extends string, V>(entries: Array<[K, V]>): Record<K, V> => {
    return entries.reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {} as Record<K, V>);
  },

  /**
   * Picks specified properties from object
   */
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  /**
   * Omits specified properties from object
   */
  omit: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result as Omit<T, K>;
  },

  /**
   * Renames object keys
   */
  renameKeys: <T>(obj: T, keyMap: Record<keyof T, string>): T => {
    const result = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = keyMap[key];
        if (newKey) {
          result[newKey as keyof T] = obj[key];
        }
      }
    }
    return result;
  },

  /**
   * Checks if object is empty
   */
  isEmpty: (obj: any): boolean => {
    if (obj == null) {
      return true;
    }
    if (typeof obj !== 'object') {
      return true;
    }
    if (Array.isArray(obj)) {
      return obj.length === 0;
    }
    return Object.keys(obj).length === 0;
  },

  /**
   * Checks if object is not empty
   */
  isNotEmpty: (obj: any): boolean => {
    return !ObjectUtils.isEmpty(obj);
  }
};

/**
 * Deep comparison utilities
 */
export const ComparisonUtils = {
  /**
   * Deep equality check
   */
  deepEqual: (a: any, b: any): boolean => {
    if (a === b) {
      return true;
    }
    if (typeof a !== typeof b) {
      return false;
    }
    if (a == null || b == null) {
      return a === b;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!ComparisonUtils.deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) {
        return false;
      }
      for (const key of aKeys) {
        if (!b.hasOwnProperty(key) || !ComparisonUtils.deepEqual(a[key], (b as any)[key])) {
          return false;
        }
      }
      return true;
    }
    return false;
  },

  /**
   * Shallow equality check
   */
  shallowEqual: (a: any, b: any): boolean => {
    if (a === b) {
      return true;
    }
    if (typeof a !== typeof b) {
      return false;
    }
    if (a == null || b == null) {
      return a === b;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) {
        return false;
      }
      for (const key of aKeys) {
        if (!b.hasOwnProperty(key) || a[key] !== (b as any)[key]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
};

/**
 * Type checking utilities for arrays and objects
 */
export const TypeGuards = {
  /**
   * Type guard for arrays
   */
  isArray: (value: any): value is any[] => {
    return Array.isArray(value);
  },

  /**
   * Type guard for strings
   */
  isString: (value: any): value is string => {
    return typeof value === 'string';
  },

  /**
   * Type guard for numbers
   */
  isNumber: (value: any): value is number => {
    return typeof value === 'number' && !isNaN(value);
  },

  /**
   * Type guard for booleans
   */
  isBoolean: (value: any): value is boolean => {
    return typeof value === 'boolean';
  },

  /**
   * Type guard for objects
   */
  isObject: (value: any): value is object => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },

  /**
   * Type guard for functions
   */
  isFunction: (value: any): value is Function => {
    return typeof value === 'function';
  },

  /**
   * Type guard for null/undefined
   */
  isNullOrUndefined: (value: any): value is null | undefined => {
    return value === null || value === undefined;
  },

  /**
   * Type guard for plain objects
   */
  isPlainObject: (value: any): value is object => {
    return TypeGuards.isObject(value) && value.constructor === Object;
  }
};

/**
 * Entity manipulation utilities for items with ID properties
 * Handles common patterns for finding, updating, and removing items by ID
 */
export const EntityUtils = {
  /**
   * Finds an item in an array by ID or _id property
   * @param items - Array of items
   * @param id - ID to search for
   * @returns Found item or null
   */
  findById: <T extends { id?: any; _id?: any }>(items: T[], id: any): T | null => {
    if (!Array.isArray(items) || id === undefined || id === null) return null;
    return items.find(item => item.id === id || item._id === id) || null;
  },

  /**
   * Updates an item in an array by matching on ID or _id property
   * @param items - Array of items
   * @param id - ID of the item to update
   * @param updates - Updates to apply to the item
   * @returns New array with updated item
   */
  updateById: <T extends { id?: any; _id?: any }>(items: T[], id: any, updates: Partial<T>): T[] => {
    if (!Array.isArray(items) || id === undefined || id === null) return [];
    return items.map(item =>
      (item.id === id || item._id === id)
        ? { ...item, ...updates }
        : item
    );
  },

  /**
   * Removes item(s) from an array by matching on ID or _id property
   * @param items - Array of items
   * @param idsToRemove - ID(s) of the item(s) to remove
   * @returns New array without the specified item(s)
   */
  removeById: <T extends { id?: any; _id?: any }>(items: T[], idsToRemove: any | any[]): T[] => {
    if (!Array.isArray(items)) return [];
    const idsArray = Array.isArray(idsToRemove) ? idsToRemove : [idsToRemove];
    return items.filter(item =>
      !idsArray.some(id => item.id === id || item._id === id)
    );
  },

  /**
   * Checks if an array contains an item with specific ID
   * @param items - Array of items
   * @param id - ID to check for
   * @returns True if item with ID exists
   */
  hasId: <T extends { id?: any; _id?: any }>(items: T[], id: any): boolean => {
    if (!Array.isArray(items) || id === undefined || id === null) return false;
    return items.some(item => item.id === id || item._id === id);
  },

  /**
   * Filters array to include only active items (items with isActive: true)
   * @param items - Array of items with isActive property
   * @returns Array of active items
   */
  filterActive: <T extends { isActive?: boolean }>(items: T[]): T[] => {
    if (!Array.isArray(items)) return [];
    return items.filter(item => item.isActive === true);
  },

  /**
   * Filters array to include only inactive items (items with isActive: false)
   * @param items - Array of items with isActive property
   * @returns Array of inactive items
   */
  filterInactive: <T extends { isActive?: boolean }>(items: T[]): T[] => {
    if (!Array.isArray(items)) return [];
    return items.filter(item => item.isActive === false);
  }
};

/**
 * Safe array operations with null/undefined checks
 */
export const SafeArrayOps = {
  /**
   * Safely filters an array with null/undefined checks
   * @param items - Array to filter
   * @param predicate - Filter function
   * @returns Filtered array
   */
  filter: <T>(items: T[] | null | undefined, predicate: (item: T, index: number) => boolean): T[] => {
    if (!Array.isArray(items) || typeof predicate !== 'function') return [];
    return items.filter(predicate);
  },

  /**
   * Safely maps an array with null/undefined checks
   * @param items - Array to map
   * @param mapper - Map function
   * @returns Mapped array
   */
  map: <T, U>(items: T[] | null | undefined, mapper: (item: T, index: number) => U): U[] => {
    if (!Array.isArray(items) || typeof mapper !== 'function') return [];
    return items.map(mapper);
  },

  /**
   * Safely reduces an array with null/undefined checks
   * @param items - Array to reduce
   * @param reducer - Reducer function
   * @param initialValue - Initial value
   * @returns Reduced value
   */
  reduce: <T, U>(items: T[] | null | undefined, reducer: (acc: U, item: T, index: number) => U, initialValue: U): U => {
    if (!Array.isArray(items) || typeof reducer !== 'function') return initialValue;
    return items.reduce(reducer, initialValue);
  }
};

/**
 * Grouping and counting utilities
 */
export const GroupingUtils = {
  /**
   * Groups items by a specific property
   * @param items - Array of items
   * @param property - Property to group by
   * @returns Object with grouped items
   */
  groupBy: <T extends Record<string, any>>(items: T[], property: keyof T): Record<string, T[]> => {
    if (!Array.isArray(items)) return {};
    return items.reduce((groups, item) => {
      const key = item && typeof item === 'object' ? String(item[property] ?? 'unknown') : 'unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * Counts items by a boolean property
   * @param items - Array of items
   * @param property - Property name to count by
   * @returns Count object with true, false, and total counts
   */
  countByBoolean: <T extends Record<string, any>>(items: T[], property: keyof T): { true: number; false: number; total: number } => {
    if (!Array.isArray(items)) return { true: 0, false: 0, total: 0 };
    const trueCount = items.filter(item => item[property] === true).length;
    const falseCount = items.filter(item => item[property] === false).length;
    return { true: trueCount, false: falseCount, total: items.length };
  },

  /**
   * Counts items by a specific property value
   * @param items - Array of items
   * @param property - Property to count by
   * @returns Object with value counts
   */
  countBy: <T extends Record<string, any>>(items: T[], property: keyof T): Record<string, number> => {
    if (!Array.isArray(items)) return {};
    return items.reduce((counts, item) => {
      const key = String(item[property] ?? 'unknown');
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }
};

/**
 * Validation utilities
 */
export const ValidationUtils = {
  /**
   * Validates if a value is in an array of valid options
   * @param value - Value to check
   * @param validOptions - Array of valid options
   * @returns True if value is in valid options
   */
  isValidOption: <T>(value: T, validOptions: T[]): boolean => {
    if (!Array.isArray(validOptions)) return false;
    return validOptions.includes(value);
  }
};

/**
 * Conversion utilities
 */
export const ConversionUtils = {
  /**
   * Converts array-like to array
   */
  toArray: <T>(value: ArrayLike<T> | null | undefined): T[] => {
    if (value == null) {
      return [];
    }
    return Array.from(value);
  },

  /**
   * Converts object to query string
   */
  toQueryString: (params: Record<string, any>): string => {
    return Object.entries(params)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
  },

  /**
   * Converts query string to object
   */
  fromQueryString: (queryString: string): Record<string, string> => {
    const params: Record<string, string> = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },

  /**
   * Converts value to number safely
   */
  toNumber: (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  },

  /**
   * Converts value to boolean safely
   */
  toBoolean: (value: any, defaultValue: boolean = false): boolean => {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return Boolean(value);
  }
};
