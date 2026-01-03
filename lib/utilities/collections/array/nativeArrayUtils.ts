/**
 * Lightweight Array Utilities - Native Implementation
 * 
 * PURPOSE: High-performance array utilities using native JavaScript
 * optimized for bundle size and runtime performance.
 */

/**
 * Groups array elements by key function - Native implementation
 */
function groupBy(array: any[], keyFn: any): any {
  if (!Array.isArray(array)) {
    throw new Error('groupBy requires an array');
  }
  if (typeof keyFn !== 'function') {
    throw new Error('groupBy requires a key function');
  }

  const result = {};
  for (const item of array) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}

/**
 * Removes duplicate elements from array - Native implementation
 */
function unique(array: any[]): any[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return [...new Set(array)];
}

/**
 * Splits array into chunks of specified size - Native implementation
 */
function chunk(array: any[], size: number): any[][] {
  if (!Array.isArray(array)) {
    return [];
  }
  if (size <= 0) {
    throw new Error('Chunk size must be greater than 0');
  }

  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Flattens nested arrays - Native implementation
 */
function flatten(array: any[]): any[] {
  if (!Array.isArray(array)) {
    return [];
  }

  const result = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      for (const subItem of flatten(item)) {
        result.push(subItem);
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * Picks specific properties from object - Native implementation
 */
function pick(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  if (!Array.isArray(keys)) {
    return {};
  }

  const result = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Removes specific properties from object - Native implementation
 */
function omit(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  if (!Array.isArray(keys)) {
    return {};
  }

  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Deep clones an object - Native implementation
 */
function deepClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Use native structuredClone when available
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }

  // Simple fallback to avoid recursion issues
  return typeof structuredClone === 'function' ? structuredClone(obj) : obj;
}

// Named exports for tree-shaking
export {
  groupBy,
  unique,
  chunk,
  flatten,
  pick,
  omit,
  deepClone
};

// Default export for compatibility
export default {
  groupBy,
  unique,
  chunk,
  flatten,
  pick,
  omit,
  deepClone
};