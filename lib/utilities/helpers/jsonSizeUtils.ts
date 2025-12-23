/**
 * JSON size and truncation utilities
 */

/**
 * Gets JSON string size in bytes
 * @param {string} jsonString - JSON string
 * @returns {number} Size in bytes
 */
function getJsonSize(jsonString: string): number {
  return Buffer.byteLength(jsonString, 'utf8');
}

/**
 * Truncates JSON string to fit within size limit
 * @param {string} jsonString - JSON string to truncate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated JSON string
 */
function truncateJson(jsonString: string, maxSize: number): string {
  if (getJsonSize(jsonString) <= maxSize) {
    return jsonString;
  }
  
  try {
    // Try to parse and truncate the object
    const parsed: any = JSON.parse(jsonString);
    return truncateObject(parsed, maxSize);
  } catch (error) {
    // If parsing fails, just truncate the string
    return jsonString.substring(0, Math.max(0, maxSize - 3)) + '...';
  }
}

/**
 * Recursively truncates an object to fit within size limit
 * @param {*} obj - Object to truncate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated JSON string
 */
function truncateObject(obj: any, maxSize: number): string {
  // Check for circular references before stringifying
  const seen = new WeakSet();
  const hasCircularRef = (obj: any): boolean => {
    if (obj && typeof obj === 'object') {
      if (seen.has(obj)) {
        return true;
      }
      seen.add(obj);
      for (const key in obj) {
        if (hasCircularRef(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (hasCircularRef(obj)) {
    return JSON.stringify({ error: 'circular_reference_detected', truncated: true })
      .substring(0, Math.max(0, maxSize - 3)) + '...';
  }
  
  // Simple truncation: remove properties until it fits
  let truncated = { ...obj };
  const keys: any = Object.keys(truncated).reverse();
  
  for (const key of keys) {
    if (getJsonSize(JSON.stringify(truncated)) <= maxSize) {
      break;
    }
    delete truncated[key];
  }
  
  const jsonString: any = JSON.stringify(truncated);
  if (getJsonSize(jsonString) <= maxSize) {
    return jsonString;
  }
  
  // If still too big, return truncated string representation
  return JSON.stringify({ truncated: true, size: getJsonSize(JSON.stringify(obj)) })
    .substring(0, Math.max(0, maxSize - 3)) + '...';
}

export default {
  getJsonSize,
  truncateJson,
  truncateObject
};