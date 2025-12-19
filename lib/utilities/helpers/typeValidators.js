/**
 * Type validation utilities - consolidated interface for all type validators
 * This module provides backward compatibility while using the new modular structure
 */

// Import individual validator modules
const {
  isNullOrUndefined,
  isNotNullOrUndefined
} = require('./nullUndefinedValidators');

const { isString } = require('./stringValidators');
const { isNumber } = require('./numberValidators');
const { isArray } = require('./arrayValidators');
const { isObject } = require('./objectValidators');
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
module.exports = {
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