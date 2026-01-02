'use strict';

// Memoization cache for recent comparisons (LRU with 500 entries)
function ComparisonCache(maxSize) {
  maxSize = maxSize || 500;
  this.maxSize = maxSize;
  this.cache = new Map();
}

ComparisonCache.prototype.get = function(a, b) {
  var key = this.createKey(a, b);
  if (this.cache.has(key)) {
    var value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  return null;
};

ComparisonCache.prototype.set = function(a, b, result) {
  var key = this.createKey(a, b);
  if (this.cache.has(key)) {
    this.cache.delete(key);
  } else if (this.cache.size >= this.maxSize) {
    var firstKey = this.cache.keys().next().value;
    this.cache.delete(firstKey);
  }
  this.cache.set(key, result);
};

ComparisonCache.prototype.createKey = function(a, b) {
  // Create a unique key from object references
  var aId = typeof a === 'object' && a !== null ? this.getObjectId(a) : '_' + typeof a + '_' + String(a);
  var bId = typeof b === 'object' && b !== null ? this.getObjectId(b) : '_' + typeof b + '_' + String(b);
  return aId + ':' + bId;
};

ComparisonCache.prototype.getObjectId = function(obj) {
  // Use object reference for identity
  if (!obj._cmpId) {
    obj._cmpId = Math.random().toString(36).substr(2, 9);
  }
  return obj._cmpId;
};

var comparisonCache = new ComparisonCache();

function isEqual(a, b, seen) {
  seen = seen || new WeakSet();

  // Fastest path: same reference
  if (a === b) {
    return true;
  }

  // Type check before expensive operations
  if (typeof a !== typeof b) {
    return false;
  }

  // Handle null/undefined
  if (a == null || b == null) {
    return a === b;
  }

  // Only cache primitive comparisons to avoid object reference issues
  var shouldCache = (typeof a !== 'object' || a === null) && (typeof b !== 'object' || b === null);
  
  if (shouldCache) {
    var cached = comparisonCache.get(a, b);
    if (cached !== null) {
      return cached;
    }
  }

  // Handle different object types
  var aType = Object.prototype.toString.call(a);
  var bType = Object.prototype.toString.call(b);
  
  if (aType !== bType) {
    return false;
  }

  var result;

  switch (aType) {
    case '[object Number]':
      result = a === b || (isNaN(a) && isNaN(b));
      break;
    
    case '[object String]':
      result = a === b;
      break;
    
    case '[object Boolean]':
      result = a === b;
      break;
    
    case '[object Date]':
      // Optimized date comparison
      result = a.getTime() === b.getTime();
      break;
    
    case '[object RegExp]':
      result = a.source === b.source && a.flags === b.flags;
      break;
    
    case '[object Array]':
      result = equalArrays(a, b, seen);
      break;
    
    case '[object Object]':
      result = equalObjects(a, b, seen);
      break;
    
    // Handle typed arrays
    case '[object Uint8Array]':
    case '[object Int8Array]':
    case '[object Uint16Array]':
    case '[object Int16Array]':
    case '[object Uint32Array]':
    case '[object Int32Array]':
    case '[object Float32Array]':
    case '[object Float64Array]':
      result = equalTypedArrays(a, b);
      break;
    
    // Handle Map and Set
    case '[object Map]':
      result = equalMaps(a, b, seen);
      break;
    
    case '[object Set]':
      result = equalSets(a, b, seen);
      break;
    
    default:
      // For other object types, try reference equality
      result = a === b;
  }

  // Cache result for future comparisons (only primitives)
  if (shouldCache) {
    comparisonCache.set(a, b, result);
  }
  
  return result;
}

function equalArrays(a, b, seen) {
  // Early length check
  if (a.length !== b.length) {
    return false;
  }

  // Handle empty arrays quickly
  if (a.length === 0) {
    return true;
  }

  // Circular reference check
  if (seen.has(a) || seen.has(b)) {
    return false;
  }

  seen.add(a);
  seen.add(b);

  // Compare elements
  for (var i = 0; i < a.length; i++) {
    if (!isEqual(a[i], b[i], seen)) {
      seen.delete(a);
      seen.delete(b);
      return false;
    }
  }

  seen.delete(a);
  seen.delete(b);
  return true;
}

function equalObjects(a, b, seen) {
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);

  // Early property count check
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Handle empty objects quickly
  if (keysA.length === 0) {
    return true;
  }

  // Circular reference check
  if (seen.has(a) || seen.has(b)) {
    return false;
  }

  seen.add(a);
  seen.add(b);

  // Compare properties
  for (var i = 0; i < keysA.length; i++) {
    var key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key) || 
        !isEqual(a[key], b[key], seen)) {
      seen.delete(a);
      seen.delete(b);
      return false;
    }
  }

  seen.delete(a);
  seen.delete(b);
  return true;
}

function equalTypedArrays(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  // Use DataView for efficient byte-by-byte comparison
  var viewA = new DataView(a.buffer, a.byteOffset, a.byteLength);
  var viewB = new DataView(b.buffer, b.byteOffset, b.byteLength);

  for (var i = 0; i < a.byteLength; i++) {
    if (viewA.getUint8(i) !== viewB.getUint8(i)) {
      return false;
    }
  }

  return true;
}

function equalMaps(a, b, seen) {
  if (a.size !== b.size) {
    return false;
  }

  if (a.size === 0) {
    return true;
  }

  if (seen.has(a) || seen.has(b)) {
    return false;
  }

  seen.add(a);
  seen.add(b);

  var mapEntries = a.entries();
  var entry = mapEntries.next();
  while (!entry.done) {
    var currentEntry = entry.value;
    if (!b.has(currentEntry[0]) || !isEqual(currentEntry[1], b.get(currentEntry[0]), seen)) {
      seen.delete(a);
      seen.delete(b);
      return false;
    }
    entry = mapEntries.next();
  }

  seen.delete(a);
  seen.delete(b);
  return true;
}

function equalSets(a, b, seen) {
  if (a.size !== b.size) {
    return false;
  }

  if (a.size === 0) {
    return true;
  }

  if (seen.has(a) || seen.has(b)) {
    return false;
  }

  seen.add(a);
  seen.add(b);

  var setValues = a.values();
  var setValue = setValues.next();
  while (!setValue.done) {
    if (!b.has(setValue.value)) {
      seen.delete(a);
      seen.delete(b);
      return false;
    }
    setValue = setValues.next();
  }

  seen.delete(a);
  seen.delete(b);
  return true;
}

function getCacheStats() {
  return {
    size: comparisonCache.cache.size,
    maxSize: comparisonCache.maxSize
  };
}

function clearCache() {
  comparisonCache.cache.clear();
}

// Export additional utilities
isEqual.getCacheStats = getCacheStats;
isEqual.clearCache = clearCache;

module.exports = isEqual;