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
    if (obj == null) return true;
    if (typeof obj !== 'object') return true;
    if (Array.isArray(obj)) return obj.length === 0;
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
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a == null || b == null) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!ComparisonUtils.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
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
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a == null || b == null) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      for (const key of aKeys) {
        if (!b.hasOwnProperty(key) || a[key] !== (b as any)[key]) return false;
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
 * Conversion utilities
 */
export const ConversionUtils = {
  /**
   * Converts array-like to array
   */
  toArray: <T>(value: ArrayLike<T> | null | undefined): T[] => {
    if (value == null) return [];
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
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'boolean') return value;
    return Boolean(value);
  }
};