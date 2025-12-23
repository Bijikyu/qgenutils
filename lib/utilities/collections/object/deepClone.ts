/**
 * Deep clones an object or value.
 *
 * PURPOSE: Creates independent copies of nested data structures
 * to prevent mutation side effects.
 *
 * @param obj - Value to clone
 * @param visited - WeakSet of visited objects for circular reference detection
 * @returns Deep cloned value
 */
import isPlainObject from './isPlainObject.js';

function deepClone(obj: any, visited = new WeakSet()): any {
  // Handle primitive values and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Check for circular references
  if (visited.has(obj)) {
    // Return a reference to the already cloned object or handle as needed
    // For now, we'll throw an error to indicate circular reference
    throw new Error('Circular reference detected in deepClone');
  }
  
  // Mark this object as visited
  visited.add(obj);
  
  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // Handle Array objects
  if (Array.isArray(obj)) {
    const clonedArray = obj.map(item => deepClone(item, visited));
    // Clean up visited set for this branch
    visited.delete(obj);
    return clonedArray;
  }
  
  // Handle Map objects
  if (obj instanceof Map) {
    const clonedMap = new Map();
    for (const [key, value] of obj.entries()) {
      clonedMap.set(deepClone(key, visited), deepClone(value, visited));
    }
    visited.delete(obj);
    return clonedMap;
  }
  
  // Handle Set objects
  if (obj instanceof Set) {
    const clonedSet = new Set();
    for (const value of obj.values()) {
      clonedSet.add(deepClone(value, visited));
    }
    visited.delete(obj);
    return clonedSet;
  }
  
  // Handle RegExp objects
  if (obj instanceof RegExp) {
    const clonedRegExp = new RegExp(obj.source, obj.flags);
    visited.delete(obj);
    return clonedRegExp;
  }
  
  // Handle plain objects
  if (isPlainObject(obj)) {
    const cloned: any = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key], visited);
    });
    visited.delete(obj);
    return cloned;
  }
  
  // For other object types, return as-is (or could throw error)
  visited.delete(obj);
  return obj;
}

export default deepClone;
