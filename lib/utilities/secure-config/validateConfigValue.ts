'use strict';

/**
 * Validates a configuration value against a schema definition
 * @param {*} value - Value to validate
 * @param {Object} schema - Schema definition
 * @param {string} schema.type - Expected type ('string', 'number', 'boolean')
 * @param {number} [schema.min] - Minimum value for numbers
 * @param {number} [schema.max] - Maximum value for numbers
 * @param {number} [schema.minLength] - Minimum length for strings
 * @param {number} [schema.maxLength] - Maximum length for strings
 * @param {Array} [schema.enum] - Allowed values
 * @param {boolean} [schema.required] - Whether value is required
 * @returns {{isValid: boolean, error?: string}} Validation result
 * @example
 * validateConfigValue(8080, { type: 'number', min: 1, max: 65535 });
 */
const validateConfigValue = (value, schema: any): any => { // validate config value against schema
  if (!schema || typeof schema !== 'object') {
    return { isValid: true };
  }

  if (schema.required && (value === undefined || value === null || value === '')) {
    return { isValid: false, error: 'Value is required' };
  }
  if (value === undefined || value === null) {
    return { isValid: true };
  }

  if (schema.type === 'number') { // number validation
    const numValue: any = typeof value === 'number' ? value : Number(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Value must be a number' };
    }
    if (schema.min !== undefined && numValue < schema.min) {
      return { isValid: false, error: `Value must be at least ${schema.min}` };
    }
    if (schema.max !== undefined && numValue > schema.max) {
      return { isValid: false, error: `Value must not exceed ${schema.max}` };
    }
  }

  if (schema.type === 'string') { // string validation
    if (typeof value !== 'string') {
      return { isValid: false, error: 'Value must be a string' };
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      return { isValid: false, error: `Value must be at least ${schema.minLength} characters` };
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      return { isValid: false, error: `Value must not exceed ${schema.maxLength} characters` };
    }
  }

  if (schema.type === 'boolean') { // boolean validation
    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
      return { isValid: false, error: 'Value must be a boolean' };
    }
  }

  if (Array.isArray(schema.enum)) { // enum validation
    if (!schema.enum.includes(value)) {
      return { isValid: false, error: `Value must be one of: ${schema.enum.join(', ')}` };
    }
  }

  return { isValid: true };
};

export default validateConfigValue;
