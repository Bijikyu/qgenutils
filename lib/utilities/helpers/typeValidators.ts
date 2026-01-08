/**
 * Type validation utilities - consolidated interface for all type validators
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual validator modules
import nullUndefinedValidators from './nullUndefinedValidators.js';
import stringValidators from './stringValidators.js';
import numberValidators from './numberValidators.js';
import arrayValidators from './arrayValidators.js';
import objectValidators from './objectValidators.js';
import primitiveValidators from './primitiveValidators.js';
import advancedTypeValidators from './advancedTypeValidators.js';

// Export all validators for backward compatibility
export default {
  isNullOrUndefined: nullUndefinedValidators.isNullOrUndefined,
  isNotNullOrUndefined: nullUndefinedValidators.isNotNullOrUndefined,
  isString: stringValidators.isString,
  isNumber: numberValidators.isNumber,
  isBoolean: primitiveValidators.isBoolean,
  isArray: arrayValidators.isArray,
  isObject: objectValidators.isObject,
  isFunction: primitiveValidators.isFunction,
  isDate: primitiveValidators.isDate,
  getDetailedType: advancedTypeValidators.getDetailedType,
  isValidType: advancedTypeValidators.isValidType,
  createTypeValidator: advancedTypeValidators.createTypeValidator
};
