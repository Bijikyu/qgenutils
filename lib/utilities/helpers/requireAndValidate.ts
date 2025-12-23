/**
 * Common require and validate patterns for input validation with error throwing
 */

/**
 * Validates that a value meets requirements and throws error if not
 * @param {*} value - The value to validate
 * @param {string} name - Name of the parameter/field
 * @param {string} type - Expected type ('string', 'number', 'boolean', 'object', 'array')
 * @param {Object} options - Additional validation options
 * @returns {*} The validated value
 * @throws {Error} If validation fails
 */
function requireAndValidate(value, name, type, options = {}) {
  const {
    required = true,
    allowNull = false,
    allowEmpty = false,
    minLength = null,
    maxLength = null,
    min = null,
    max = null
  } = options;

  // Check for null/undefined
  if (value === null || value === undefined) {
    if (required) {
      throw new Error(`${name} is required and cannot be ${value === null ? 'null' : 'undefined'}`);
    }
    if (!allowNull) {
      throw new Error(`${name} cannot be null or undefined`);
    }
    return value;
  }

  // Type validation
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new Error(`${name} must be a string`);
      }
      if (!allowEmpty && value.trim() === '') {
        throw new Error(`${name} cannot be empty`);
      }
      if (minLength !== null && value.length < minLength) {
        throw new Error(`${name} must be at least ${minLength} characters long`);
      }
      if (maxLength !== null && value.length > maxLength) {
        throw new Error(`${name} must be at most ${maxLength} characters long`);
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`${name} must be a valid number`);
      }
      if (min !== null && value < min) {
        throw new Error(`${name} must be at least ${min}`);
      }
      if (max !== null && value > max) {
        throw new Error(`${name} must be at most ${max}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new Error(`${name} must be a boolean`);
      }
      break;

    case 'object':
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${name} must be an object`);
      }
      if (!allowEmpty && Object.keys(value).length === 0) {
        throw new Error(`${name} cannot be empty`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        throw new Error(`${name} must be an array`);
      }
      if (!allowEmpty && value.length === 0) {
        throw new Error(`${name} cannot be empty`);
      }
      if (minLength !== null && value.length < minLength) {
        throw new Error(`${name} must have at least ${minLength} item(s)`);
      }
      if (maxLength !== null && value.length > maxLength) {
        throw new Error(`${name} must have at most ${maxLength} item(s)`);
      }
      break;

    default:
      throw new Error(`Unknown type: ${type}`);
  }

  return value;
}

/**
 * Validates a string parameter
 * @param {*} value - The value to validate
 * @param {string} name - Parameter name
 * @param {Object} options - Validation options
 * @returns {string} The validated string
 */
function requireString(value, name, options = {}) {
  return requireAndValidate(value, name, 'string', options);
}

/**
 * Validates a number parameter
 * @param {*} value - The value to validate
 * @param {string} name - Parameter name
 * @param {Object} options - Validation options
 * @returns {number} The validated number
 */
function requireNumber(value, name, options = {}) {
  return requireAndValidate(value, name, 'number', options);
}

/**
 * Validates a boolean parameter
 * @param {*} value - The value to validate
 * @param {string} name - Parameter name
 * @param {Object} options - Validation options
 * @returns {boolean} The validated boolean
 */
function requireBoolean(value, name, options = {}) {
  return requireAndValidate(value, name, 'boolean', options);
}

/**
 * Validates an object parameter
 * @param {*} value - The value to validate
 * @param {string} name - Parameter name
 * @param {Object} options - Validation options
 * @returns {Object} The validated object
 */
function requireObject(value, name, options = {}) {
  return requireAndValidate(value, name, 'object', options);
}

/**
 * Validates an array parameter
 * @param {*} value - The value to validate
 * @param {string} name - Parameter name
 * @param {Object} options - Validation options
 * @returns {Array} The validated array
 */
function requireArray(value, name, options = {}) {
  return requireAndValidate(value, name, 'array', options);
}

/**
 * Validates multiple parameters at once
 * @param {Object} params - Object containing parameters to validate
 * @param {Object} schema - Validation schema where keys are param names and values are validation configs
 * @returns {Object} Validated parameters object
 * @throws {Error} If any validation fails
 */
function requireAndValidateMultiple(params, schema) {
  const validated: any = {};
  const errors: any = [];

  for (const [name, config] of Object.entries(schema)) {
    try {
      const { type, ...options }: any = config;
      validated[name] = requireAndValidate(params[name], name, type, options);
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed for multiple parameters: ${errors.join(', ')}`);
  }

  return validated;
}

export default {
  requireAndValidate,
  requireString,
  requireNumber,
  requireBoolean,
  requireObject,
  requireArray,
  requireAndValidateMultiple
};