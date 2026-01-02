'use strict';

function deepClone(value, seen, depth) {
  seen = seen || new WeakSet();
  depth = depth || 0;

  // Early exit primitives - most common case
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Circular reference detection
  if (seen.has(value)) {
    return {};
  }

  // Add to seen before processing to handle self-references
  seen.add(value);

  // Handle special object types efficiently
  var objectType = Object.prototype.toString.call(value);
  
  switch (objectType) {
    case '[object Date]':
      // Validate Date before accessing getTime() - more robust check
      if (value && Object.prototype.toString.call(value) === '[object Date]' && typeof value.getTime === 'function') {
        const dateResult = new Date(value.getTime());
        seen.delete(value);
        return dateResult;
      }
      seen.delete(value);
      return new Date(); // Fallback to current date
    
    case '[object RegExp]':
      // Handle RegExp with feature detection
      var flags = value.flags || (value.global ? 'g' : '') + (value.ignoreCase ? 'i' : '') + (value.multiline ? 'm' : '');
      var regexResult = new RegExp(value.source, flags);
      seen.delete(value);
      return regexResult;
    
    case '[object Array]':
      var result = new Array(value.length);
      
      // Optimize for sparse arrays
      for (var i = 0; i < value.length; i++) {
        if (i in value) {
          result[i] = deepClone(value[i], seen, depth + 1);
        }
      }
      seen.delete(value);
      return result;
    
    case '[object Object]':
      var clone = {};
      
      // Get own property names efficiently
      var keys = Object.keys(value);
      
      // Batch property assignment for better performance
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        clone[key] = deepClone(value[key], seen, depth + 1);
      }
      
      seen.delete(value);
      return clone;
    
    // Handle typed arrays efficiently
    case '[object Uint8Array]':
    case '[object Int8Array]':
    case '[object Uint16Array]':
    case '[object Int16Array]':
    case '[object Uint32Array]':
    case '[object Int32Array]':
    case '[object Float32Array]':
    case '[object Float64Array]':
      seen.delete(value);
      return value.slice();
    
    case '[object ArrayBuffer]':
      seen.delete(value);
      // ArrayBuffer.slice() is not universally supported
      if (typeof value.slice === 'function') {
        return value.slice(0);
      }
      // Fallback: manually copy bytes
      var bufferResult = new ArrayBuffer(value.byteLength);
      var source = new Uint8Array(value);
      var target = new Uint8Array(bufferResult);
      for (var i = 0; i < source.length; i++) {
        target[i] = source[i];
      }
      return bufferResult;
    
    // Default: return as-is for unsupported object types
    default:
      return value;
  }
}

// Cache management functions for monitoring
function getCacheStats() {
  return {
    size: 0, // deepClone doesn't use cache
    maxSize: 0
  };
}

function clearCache() {
  // No cache to clear for deepClone
}

// Export additional utilities for testing and monitoring
deepClone.getCacheStats = getCacheStats;
deepClone.clearCache = clearCache;

module.exports = deepClone;