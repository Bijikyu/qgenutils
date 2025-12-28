/**
 * Primitive Type Validation Utilities
 * 
 * Purpose: Provides reliable type checking functions for JavaScript primitive types
 * and common object types. These utilities are essential for input validation,
 * type safety, and runtime type checking in TypeScript/JavaScript applications.
 * 
 * Design Philosophy:
 * - Performance: Optimized for frequent type checking operations
 * - Reliability: Handles edge cases and type coercion issues
 * - Consistency: Uniform API across all validator functions
 * - Safety: Prevents type-related runtime errors
 * 
 * Validation Strategy:
 * - typeof operator for primitive types (fast and reliable)
 * - instanceof operator for object types (prototype checking)
 * - Additional validation for complex types (Date validity)
 * - Options-based configuration for flexible validation rules
 * 
 * Use Cases:
 * - Input validation in API endpoints
 * - Type checking in utility functions
 * - Runtime type safety in dynamic code
 * - Form validation and data processing
 * - Error handling and type assertions
 * 
 * Performance Considerations:
 * - typeof is the fastest way to check primitive types
 * - instanceof provides reliable object type checking
 * - Minimal overhead for validation operations
 * - Suitable for high-frequency validation scenarios
 * 
 * @author Validation Utilities Team
 * @since 1.0.0
 */

/**
 * Function Type Validator
 * 
 * Checks if the provided value is a function. This is essential for
 * validating callbacks, event handlers, and higher-order function parameters.
 * 
 * Validation Criteria:
 * - Uses typeof operator for reliable function detection
 * - Handles both regular functions and arrow functions
 * - Distinguishes functions from callable objects
 * - Works across all JavaScript execution contexts
 * 
 * Edge Cases Handled:
 * - null/undefined: Returns false (not functions)
 * - Objects with call method: Returns false (typeof !== 'function')
 * - Async functions: Returns true (typeof === 'function')
 * - Generator functions: Returns true (typeof === 'function')
 * 
 * Performance Notes:
 * - typeof operator is highly optimized in JavaScript engines
 * - O(1) time complexity with minimal overhead
 * - No object creation or prototype chain traversal
 * - Suitable for validation in performance-critical code
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
  return typeof value === 'function';
}

/**
 * Boolean Type Validator
 * 
 * Checks if the provided value is a boolean primitive. This validator
 * is crucial for distinguishing boolean values from truthy/falsy objects
 * and preventing type coercion issues.
 * 
 * Validation Criteria:
 * - Uses typeof operator for precise boolean detection
 * - Only returns true for boolean primitives (true/false)
 * - Distinguishes from Boolean wrapper objects
 * - Handles all edge cases correctly
 * 
 * Edge Cases Handled:
 * - Boolean objects (new Boolean(true)): Returns false
 * - Truthy values (1, "true", []): Returns false
 * - Falsy values (0, "", null): Returns false
 * - undefined: Returns false
 * 
 * Type Coercion Prevention:
 * - Does not perform implicit type conversion
 * - Explicit boolean primitive checking only
 * - Prevents common JavaScript type coercion bugs
 * - Ensures boolean logic integrity
 * 
 * Performance Notes:
 * - typeof operator is fastest boolean check
 * - No object creation or method calls
 * - O(1) time complexity
 * - Ideal for validation loops and conditionals
 * 
 * @param {*} value - Value to be checked for boolean type
 * @returns {boolean} True if value is a boolean primitive, false otherwise
 * 
 * @example
 * isBoolean(true); // true
 * isBoolean(false); // true
 * isBoolean(new Boolean(true)); // false (wrapper object)
 * isBoolean(1); // false (truthy but not boolean)
 * isBoolean("true"); // false (truthy but not boolean)
 */
function isBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

/**
 * Date Object Validator with Configurable Validity Checking
 * 
 * Checks if the provided value is a Date object with optional validity validation.
 * This validator is essential for date input validation, timestamp processing,
 * and datetime operations in applications.
 * 
 * Validation Strategy:
 * 1. Type Check: Uses instanceof to verify Date object type
 * 2. Validity Check: Optionally validates date using getTime() method
 * 3. Configuration: Flexible options for different validation requirements
 * 
 * Validation Criteria:
 * - Must be instanceof Date (prevents date-like objects)
 * - Optional validity check based on allowInvalid option
 * - Invalid dates are those where getTime() returns NaN
 * - Valid dates have meaningful timestamp values
 * 
 * Configuration Options:
 * - allowInvalid (false): If true, accepts invalid Date objects
 * - allowInvalid (false): If false, only accepts valid Date objects
 * - Default behavior: Only accepts valid dates (strict validation)
 * 
 * Edge Cases Handled:
 * - Invalid Date objects: new Date('invalid')
 * - Date-like objects: { getTime: () => Date.now() }
 * - Timestamp numbers: Not Date objects (returns false)
 * - String dates: Not Date objects (returns false)
 * 
 * Use Cases:
 * - Form validation for date inputs
 * - API parameter validation
 * - Database date field validation
 * - Datetime processing pipelines
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
 * isDate({ getTime: () => {} }); // false (not instanceof Date)
 * isDate(1234567890); // false (timestamp, not Date object)
 */
function isDate(value: any, options: Record<string, any> = {}): boolean {
  const { allowInvalid = false }: any = options;
  
  // Step 1: Verify object is instanceof Date (prevents date-like objects)
  if (!(value instanceof Date)) {
    return false;
  }
  
  // Step 2: Check date validity if strict validation is required
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