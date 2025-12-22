/**
 * Type validation utilities - consolidated interface for all type validators
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual validator modules
import nullUndefinedValidators from './nullUndefinedValidators';
import stringValidators from './stringValidators';
import numberValidators from './numberValidators';
import arrayValidators from './arrayValidators';
import objectValidators from './objectValidators';
import primitiveValidators from './primitiveValidators';
import advancedTypeValidators from './advancedTypeValidators';

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