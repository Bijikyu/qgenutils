/**
 * Deep clones an object or value.
 *
 * PURPOSE: Creates independent copies of nested data structures
 * to prevent mutation side effects.
 *
 * @param {*} obj - Value to clone
 * @returns {*} Deep cloned value
 */
import isPlainObject from './isPlainObject.js';

function deepClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  if (isPlainObject(obj)) {
    const cloned: any = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
  
  return obj;
}

export default deepClone;
