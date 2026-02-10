import { qerrors } from '@bijikyu/qerrors';

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
    // Try to parse and truncate object
    const parsed: any = JSON.parse(jsonString);
    return truncateObject(parsed, maxSize);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'truncateJson', `JSON parsing failed for size: ${jsonString.length}`);
    // If parsing fails, just truncate string
    return jsonString.substring(0, Math.max(0, maxSize - 3)) + '...';
  }
}

/**
 * Recursively truncates an object to fit within size limit
 * @param {*} obj - Object to truncate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated JSON string
 */
function truncateObject(obj: unknown, maxSize: number): string {
  // Check for circular references before stringifying
  const seen = new WeakSet();
  const hasCircularRef = (obj: unknown): boolean => {
    if (obj && typeof obj === 'object' && obj !== null) {
      if (seen.has(obj as object)) {
        return true;
      }
      seen.add(obj as object);
      if (Array.isArray(obj)) {
        for (let i = 0; i < (obj as unknown[]).length; i++) {
          if (hasCircularRef((obj as unknown[])[i])) {
            return true;
          }
        }
      } else {
        for (const key in obj as object) {
          if (hasCircularRef((obj as Record<string, unknown>)[key])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  try {
    if (hasCircularRef(obj)) {
      return JSON.stringify({ error: 'circular_reference_detected', truncated: true })
        .substring(0, Math.max(0, maxSize - 3)) + '...';
    }
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'truncateObject', 'Circular reference detection failed');
    return JSON.stringify({ error: 'truncation_failed', truncated: true })
      .substring(0, Math.max(0, maxSize - 3)) + '...';
  }

  // Simple truncation: remove properties until it fits
  let truncated: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  const keys: string[] = Object.keys(truncated).reverse();

  try {
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
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'truncateObject', 'Object truncation failed');
    return JSON.stringify({ error: 'truncation_failed', truncated: true })
      .substring(0, Math.max(0, maxSize - 3)) + '...';
  }
}

export default {
  getJsonSize,
  truncateJson,
  truncateObject
};
