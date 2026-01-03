/**
 * SCALABILITY FIX: Optimized deep merge with performance improvements
 * 
 * PURPOSE: Combines configuration objects, default values with overrides,
 * or nested data structures without losing nested properties.
 * 
 * SCALABILITY IMPROVEMENTS:
 * - Optimized prototype pollution checking with Set for O(1) lookup
 * - Depth limiting to prevent stack overflow
 * - Reduced string operations and comparisons
 * - Early returns for better performance
 */

import isPlainObject from './isPlainObject.js';

// Pre-computed Set for dangerous keys (O(1) lookup instead of O(n) array.includes)
const DANGEROUS_KEYS = new Set([
  '__proto__', 'constructor', 'prototype',
  '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__',
  '__eval__', '__function__', '__script__', 'constructor.prototype'
]);

// Maximum recursion depth to prevent stack overflow
const MAX_DEPTH = 100;

// Optimized dangerous key check function - reduces redundant string operations
function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key) || 
         key === '__proto__' || 
         key === 'constructor' || 
         key === 'prototype' ||
         key.startsWith('__') ||
         key.includes('proto') ||
         key.includes('constructor');
}

function deepMerge(...objects: any[]) {
  return _deepMerge(objects, 0);
}

// Internal recursive function with depth tracking
function _deepMerge(objects: any[], depth: number): any {
  if (depth > MAX_DEPTH) {
    throw new Error('Maximum merge depth exceeded to prevent stack overflow');
  }
  
  return objects.reduce((result, obj: any): any => {
    if (!obj || typeof obj !== 'object') return result;
    
    // Use Object.keys for better performance than getOwnPropertyNames
    const ownKeys = Object.keys(obj);
    
    for (let i = 0; i < ownKeys.length; i++) {
      const key = ownKeys[i];
      
      // Optimized dangerous key checking with single function call
      if (isDangerousKey(key)) {
        continue;
      }
      
      // Ensure we only work with own properties
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }
      
      const value: any = obj[key];
      const existingValue: any = result[key];
      
      // Additional check to prevent prototype pollution through Object.defineProperty
      if (typeof value === 'function' && (key === '__defineGetter__' || key === '__defineSetter__')) {
        continue;
      }
      
      if (isPlainObject(value) && isPlainObject(existingValue)) {
        result[key] = _deepMerge([existingValue, value], depth + 1);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }, {});
}

export default deepMerge;