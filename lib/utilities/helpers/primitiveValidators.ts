/**
 * Primitive Type Validation Utilities - refactored to use lodash modules
 * 
 * Purpose: Provides reliable type checking functions using lodash for consistency
 * across the codebase. These utilities leverage lodash's battle-tested implementations
 * for better performance and reliability.
 * 
 * Design Philosophy:
 * - Consistency: Use lodash.is* functions throughout the codebase
 * - Performance: Leverage lodash's optimized implementations
 * - Reliability: Use battle-tested utilities instead of custom implementations
 * - Maintainability: Reduce custom code in favor of well-maintained libraries
 * 
 * Validation Strategy:
 * - lodash.isFunction for function type checking
 * - lodash.isBoolean for boolean primitive checking
 * - lodash.isDate for Date object validation with custom validity options
 * - Options-based configuration for flexible validation rules
 * 
 * Use Cases:
 * - Input validation in API endpoints
 * - Type checking in utility functions
 * - Runtime type safety in dynamic code
 * - Form validation and data processing
 * - Error handling and type assertions
 */

import lodash from 'lodash';
const { isFunction: lodashIsFunction, isBoolean: lodashIsBoolean, isDate: lodashIsDate } = lodash as any;

/**
 * Function Type Validator
 * 
 * Uses lodash.isFunction for consistent function type checking across the codebase.
 * Leverages lodash's optimized implementation that handles all edge cases correctly.
 * 
 * @param {*} value - Value to be checked for function type
 * @returns {boolean} True if value is a function, false otherwise
 * 
 * @example
 * isFunction(() => {}); // true
 * isFunction(function() {}); // true
 * isFunction({}); // false
 * isFunction(null); // false
 */
function isFunction(value: any): boolean {
  return lodashIsFunction(value);
}

/**
 * Boolean Type Validator
 * 
 * Uses lodash.isBoolean for consistent boolean primitive checking.
 * Distinguishes boolean primitives from Boolean wrapper objects and truthy values.
 * 
 * @param {*} value - Value to be checked for boolean type
 * @returns {boolean} True if value is a boolean primitive, false otherwise
 * 
 * @example
 * isBoolean(true); // true
 * isBoolean(false); // true
 * isBoolean(new Boolean(true)); // false (wrapper object)
 * isBoolean(1); // false (truthy but not boolean)
 */
function isBoolean(value: any): boolean {
  return lodashIsBoolean(value);
}

/**
 * Date Object Validator with Configurable Validity Checking
 * 
 * Uses lodash.isDate as the base validation and adds custom validity checking
 * for strict validation requirements. This provides consistency with lodash
 * while maintaining the existing API for validity checking.
 * 
 * @param {*} value - Value to be checked for Date type
 * @param {Object} options - Validation configuration options
 * @param {boolean} [options.allowInvalid=false] - Whether to accept invalid Date objects
 * @returns {boolean} True if value is a Date object (and valid if allowInvalid is false)
 * 
 * @example
 * // Strict validation (default)
 * isDate(new Date()); // true
 * isDate(new Date('2023-01-01')); // true
 * isDate(new Date('invalid')); // false
 * 
 * @example
 * // Allow invalid dates
 * isDate(new Date('invalid'), { allowInvalid: true }); // true
 */
function isDate(value: any, options: Record<string, any> = {}): boolean {
  const { allowInvalid = false }: any = options;
  
  // Use lodash.isDate for consistent Date object checking
  if (!lodashIsDate(value)) {
    return false;
  }
  
  // Add custom validity checking if strict validation is required
  // Guard against Invalid Date objects
  if (!allowInvalid && isNaN(value.getTime())) {
    return false;
  }
  
  return true;
}

export default {
  isFunction,
  isBoolean,
  isDate
};
