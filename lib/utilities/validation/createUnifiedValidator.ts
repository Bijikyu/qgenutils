'use strict';

/**
 * Creates a unified validator with core, simple wrapper, and middleware functions
 * @param {Function} coreValidator - Core validation function that returns { isValid, value?, errors }
 * @param {Object} [options] - Configuration options
 * @param {Object} [options.errorMessages] - Custom error messages
 * @param {Function} [options.transformValue] - Optional value transformation
 * @param {Function} [options.formatError] - Custom error formatting function
 * @returns {Object} Unified validator with multiple interfaces
 * @example
 * const numberValidator = createUnifiedValidator((value, options: any): any => {
 *   if (typeof value !== 'number') {
 *     return { isValid: false, errors: ['not_number'] };
 *   }
 *   return { isValid: true, value };
 * });
 */
function createUnifiedValidator(coreValidator: any, options: any = {}) {
  const { 
    errorMessages = {},
    transformValue,
    formatError = (_fieldName, message, _details) => ({ error: message })
  } = options;

  /**
   * Core validation function with comprehensive result
   * @param {*} value - Value to validate
   * @param {Object} [validateOptions] - Validation options
   * @returns {Object} Validation result with isValid, value, and errors
   */
  const validateCore = (value: any, validateOptions: any = {}): any => {
    let transformedValue = value;
    
    // Apply transformation if provided
    if (transformValue && typeof transformValue === 'function') {
      try {
        transformedValue = transformValue(value, validateOptions);
      } catch (err) {
        return { isValid: false, errors: ['transform_error'], originalValue: value };
      }
    }

    // Run core validation
    return coreValidator(transformedValue, validateOptions);
  };

  /**
   * Simple validation that returns null or error object
   * @param {*} value - Value to validate
   * @param {string} [fieldName] - Field name for error messages
   * @param {Object} [validateOptions] - Validation options
   * @returns {Object|null} Error object or null if valid
   */
  const validateSimple = (value: any, fieldName: any, validateOptions: any = {}): any => {
    const result: any = validateCore(value, validateOptions);
    
    if (result.isValid) {
      return null;
    }

    // Format error message
    const errorMessage = result.errors[0] 
      ? (errorMessages[result.errors[0]] || `Invalid ${fieldName || 'value'}`)
      : `${fieldName || 'Value'} is invalid`;

    return formatError(fieldName, errorMessage, {
      errors: result.errors,
      value: result.originalValue || value
    });
  };

  /**
   * Express middleware validation for request fields
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string} fieldName - Name of field to validate
   * @param {Object} [validateOptions] - Validation options
   * @param {Function} [errorHandler] - Async error handler function
   * @returns {Promise<*>} Validated value or default
   */
  const validateMiddleware = async (req: any, res: any, fieldName: any, validateOptions: any = {}, errorHandler: any): Promise<any> => {
    const value: any = req.body?.[fieldName];
    const result: any = validateCore(value, validateOptions);

    if (result.isValid) {
      return result.value;
    }

    // Handle validation failure with error handler
    if (errorHandler && typeof errorHandler === 'function') {
      const errorMessage = result.errors[0] 
        ? (errorMessages[result.errors[0]] || `Invalid field: ${fieldName}`)
        : `${fieldName} is invalid`;

      await errorHandler(res, errorMessage, fieldName, {
        errors: result.errors,
        receivedValue: result.originalValue || value,
        receivedType: typeof value
      });
    }

    return undefined;
  };

  /**
   * Batch validation for multiple fields
   * @param {Object} data - Data object to validate
   * @param {Object} fieldConfigs - Field configuration object
   * @returns {Object} Validation results
   */
  const validateBatch = (data, fieldConfigs: any): any => {
    const results: any = {};
    const errors: any = {};
    let isValid = true;

    for (const [fieldName, config] of Object.entries(fieldConfigs)) {
      const value: any = data[fieldName];
      const result: any = validateCore(value, config);
      
      results[fieldName] = result.isValid ? result.value : value;
      
      if (!result.isValid) {
        // Pre-compute error messages for better performance
        errors[fieldName] = result.errors.map(err => 
          errorMessages[err] || `Invalid ${fieldName}`
        );
        isValid = false;
      }
    }

    return { isValid, results, errors };
  };

  return {
    validateCore,
    validateSimple,
    validateMiddleware,
    validateBatch
  };
}

/**
 * Creates a unified validator with built-in common options
 * @param {Function} validationFn - Simple validation function
 * @param {Object} [defaultOptions] - Default validation options
 * @returns {Object} Unified validator with standard interfaces
 */
function createStandardUnifiedValidator(validationFn: any, defaultOptions: any = {}) {
  const standardErrorMessages = {
    required: 'is required',
    invalid_type: 'has invalid type',
    out_of_range: 'is out of range',
    too_short: 'is too short',
    too_long: 'is too long',
    invalid_format: 'has invalid format',
    not_number: 'must be a number',
    not_boolean: 'must be true or false',
    not_string: 'must be a string',
    not_array: 'must be an array',
    not_object: 'must be an object'
  };

  return createUnifiedValidator(validationFn, {
    errorMessages: { ...standardErrorMessages, ...defaultOptions.errorMessages },
    ...defaultOptions
  });
}

/**
 * Creates a unified validator for type checking
 * @param {string} expectedType - Expected JavaScript type
 * @param {Object} [options] - Additional options
 * @returns {Object} Unified type validator
 */
function createTypeUnifiedValidator(expectedType, options = {}) {
  const typeCheckMap = {
    string: (val) => typeof val === 'string',
    number: (val) => typeof val === 'number' && !isNaN(val),
    boolean: (val) => typeof val === 'boolean',
    object: (val) => typeof val === 'object' && val !== null && !Array.isArray(val),
    array: (val) => Array.isArray(val),
    function: (val) => typeof val === 'function'
  };

  const checkFn: any = typeCheckMap[expectedType];
  if (!checkFn) {
    throw new Error(`Unsupported type: ${expectedType}`);
  }

  return createStandardUnifiedValidator((value, validateOptions: any): any => {
    const { required = false, defaultValue = null }: any = validateOptions;

    // Handle missing values
    if (value === undefined || value === null) {
      if (required) {
        return { isValid: false, errors: ['required'], originalValue: value };
      }
      return { isValid: true, value: defaultValue };
    }

    // Check type
    if (!checkFn(value)) {
      return { isValid: false, errors: ['invalid_type'], originalValue: value };
    }

    return { isValid: true, value };
  }, options);
}

export default {
  createUnifiedValidator,
  createStandardUnifiedValidator,
  createTypeUnifiedValidator
};