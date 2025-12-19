

/**
 * Validates that a value is in allowed enum values
 * @param {*} value - Value to validate
 * @param {Array} validValues - Array of valid values
 * @param {string} fieldName - Name of field for error messages
 * @returns {{error: string, validOptions: Array}|null} Validation error or null if valid
 * @example
 * validateEnum('pending', ['pending', 'active', 'inactive'], 'status');
 */
const validateEnum = (value: any, validValues: any, fieldName: any): any => { // check value is in allowed list
  if (!Array.isArray(validValues)) throw new Error('validValues must be an array');

  if (validValues.includes(value)) return null;

  return {
    error: `Invalid ${fieldName || 'value'}`,
    validOptions: validValues
  };
};

export default validateEnum;
