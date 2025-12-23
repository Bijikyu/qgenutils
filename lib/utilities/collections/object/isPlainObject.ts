/**
 * Checks if a value is a plain object (not array, Date, Map, etc).
 *
 * PURPOSE: Distinguishes plain objects from other object types
 * for recursive operations like deep merge and deep clone.
 *
 * @param value - Value to check
 * @returns True if plain object
 */
function isPlainObject(value: any): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Check for built-in object types that should not be considered plain objects
  const objectToString = Object.prototype.toString.call(value);
  
  // Exclude arrays, dates, regex, maps, sets, errors, functions, etc.
  const excludedTypes = [
    '[object Array]',
    '[object Date]',
    '[object RegExp]',
    '[object Map]',
    '[object Set]',
    '[object WeakMap]',
    '[object WeakSet]',
    '[object Error]',
    '[object TypeError]',
    '[object ReferenceError]',
    '[object SyntaxError]',
    '[object Function]',
    '[object AsyncFunction]',
    '[object GeneratorFunction]',
    '[object ArrayBuffer]',
    '[object DataView]',
    '[object Int8Array]',
    '[object Uint8Array]',
    '[object Uint8ClampedArray]',
    '[object Int16Array]',
    '[object Uint16Array]',
    '[object Int32Array]',
    '[object Uint32Array]',
    '[object Float32Array]',
    '[object Float64Array]',
    '[object BigInt64Array]',
    '[object BigUint64Array]',
    '[object Promise]',
    '[object Proxy]'
  ];

  if (excludedTypes.includes(objectToString)) {
    return false;
  }

  // Additional checks for specific object types
  if (value instanceof Error || 
      typeof value === 'function' ||
      value instanceof Promise ||
      value instanceof Proxy) {
    return false;
  }

  // Check if it's a plain object created by Object constructor or object literal
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export default isPlainObject;
