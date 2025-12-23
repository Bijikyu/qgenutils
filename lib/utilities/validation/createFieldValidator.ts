'use strict';

/**
 * Creates a field validator function with consistent error handling
 * @param {Function} validationFn - Function that takes a value and returns boolean
 * @param {string} errorMessage - Error message template (can include placeholders)
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.allowEmptyStrings=true] - Whether empty strings pass validation
 * @param {Function} [options.transform] - Optional transform function before validation
 * @returns {Function} Validator function that takes (value, fieldName)
 * @example
 * const isBoolean: any = (val) => typeof val === 'boolean';
 * const validateBoolean: any = createFieldValidator(isBoolean, 'must be true or false');
 * validateBoolean(true, 'active'); // null
 * validateBoolean('yes', 'active'); // { error: 'active must be true or false' }
 */
function createFieldValidator(validationFn: (value: any) => boolean, errorMessage: string, options: any = {}) {
  if (typeof validationFn !== 'function') {
    throw new Error('Validation function must be a function');
  }
  if (typeof errorMessage !== 'string') {
    throw new Error('Error message must be a string');
  }
  
  const { allowEmptyStrings = true, transform }: any = options;

  return (value: any, fieldName: string): any => {
    let transformedValue = value;
    
    // Apply transform if provided
    if (transform && typeof transform === 'function') {
      try {
        transformedValue = transform(value);
      } catch (err) {
        return { error: `${fieldName || 'Value'} is invalid` };
      }
    }

    // Handle empty strings based on options
    if (!allowEmptyStrings && transformedValue === '') {
      return { error: `${fieldName || 'Value'} cannot be empty` };
    }

    // Run validation
    if (validationFn(transformedValue)) {
      return null;
    }

    // Format error message with field name
    const formattedMessage = errorMessage.includes('{field}') 
      ? errorMessage.replace('{field}', fieldName || 'Value')
      : `${fieldName || 'Value'} ${errorMessage}`;

    return { error: formattedMessage };
  };
}

/**
 * Creates a type validator for basic JavaScript types
 * @param {string} type - Expected type ('string', 'number', 'boolean', 'object', 'function')
 * @param {string} [customMessage] - Custom error message
 * @returns {Function} Type validator function
 */
function createTypeValidator(type: string, customMessage?: string) {
  const typeCheckMap: Record<string, (val: any) => boolean> = {
    string: (val: any) => typeof val === 'string',
    number: (val: any) => typeof val === 'number' && !isNaN(val),
    boolean: (val: any) => typeof val === 'boolean',
    object: (val: any) => typeof val === 'object' && val !== null && !Array.isArray(val),
    function: (val: any) => typeof val === 'function',
    array: (val: any) => Array.isArray(val)
  };

  const validationFn: any = typeCheckMap[type];
  if (!validationFn) {
    throw new Error(`Unsupported type: ${type}`);
  }

  const errorMessage: any = customMessage || `must be a ${type}`;
  return createFieldValidator(validationFn, errorMessage);
}

/**
 * Creates a validator for string patterns (regex, length, etc.)
 * @param {RegExp} pattern - Regex pattern to test against
 * @param {string} [customMessage] - Custom error message
 * @returns {Function} Pattern validator function
 */
function createPatternValidator(pattern: RegExp, customMessage?: string) {
  return createFieldValidator(
    (value: any) => typeof value === 'string' && pattern.test(value),
    customMessage || 'does not match required pattern'
  );
}

/**
 * Creates a validator for numeric ranges
 * @param {number} [min] - Minimum allowed value
 * @param {number} [max] - Maximum allowed value
 * @param {string} [customMessage] - Custom error message
 * @returns {Function} Range validator function
 */
function createRangeValidator(min?: number, max?: number, customMessage?: string) {
  return createFieldValidator(
    (value: any) => typeof value === 'number' && 
              (min === undefined || value >= min) && 
              (max === undefined || value <= max),
    customMessage || (() => {
      if (min !== undefined && max !== undefined) {
        return `must be between ${min} and ${max}`;
      }
      if (min !== undefined) {
        return `must be at least ${min}`;
      }
      if (max !== undefined) {
        return `must be at most ${max}`;
      }
      return 'must be a valid number';
    })()
  );
}

/**
 * Creates a validator that combines multiple validators with AND logic
 * @param {Array<Function>} validators - Array of validator functions
 * @returns {Function} Combined validator function
 */
function createCombinedValidator(validators: Function[]) {
  if (!Array.isArray(validators) || validators.length === 0) {
    throw new Error('Validators array is required');
  }

  return (value: any, fieldName: string): any => {
    for (const validator of validators) {
      const result: any = validator(value, fieldName);
      if (result) {
        return result; // Return first error encountered
      }
    }
    return null; // All validations passed
  };
}

export {
  createFieldValidator,
  createTypeValidator,
  createPatternValidator,
  createRangeValidator,
  createCombinedValidator
};

export default createFieldValidator;