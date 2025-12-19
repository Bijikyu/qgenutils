/**
 * Type validation utilities - consolidated interface for all type validators
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual validator modules
const {
  isNullOrUndefined,
  isNotNullOrUndefined
} = require('./nullUndefinedValidators');

import { isString } from './stringValidators';
import { isNumber } from './numberValidators';
import { isArray } from './arrayValidators';
import { isObject } from './objectValidators';
const {
  isFunction,
  isBoolean,
  isDate
} = require('./primitiveValidators');
const {
  getDetailedType,
  isValidType,
  createTypeValidator
} = require('./advancedTypeValidators');

// Export all validators for backward compatibility
export default {
  isNullOrUndefined,
  isNotNullOrUndefined,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isDate,
  getDetailedType,
  isValidType,
  createTypeValidator
};