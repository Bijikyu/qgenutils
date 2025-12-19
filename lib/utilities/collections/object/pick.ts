/**
 * Picks specific keys from an object.
 *
 * PURPOSE: Extracts subset of object properties for API responses,
 * form data extraction, or security filtering.
 *
 * @param obj - Source object
 * @param keys - Keys to include
 * @returns New object with only specified keys
 */
const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  if (!obj || typeof obj !== 'object' || !Array.isArray(keys)) {
    return {} as Pick<T, K>;
  }

  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  
  return result;
};

export default pick;