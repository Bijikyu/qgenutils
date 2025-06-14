
/*

 * WHY THIS MODULE EXISTS:
 * - Share common primitives for checking objects, strings and Express types.
 *
 * MAIN PROBLEMS SOLVED:
 * - Prevent runtime errors when modules receive unexpected parameter types.
 * - Keep validation logic DRY across multiple utilities.
 *
 * EXPRESS ASSUMPTIONS:
 * - Some helpers expect objects resembling Express responses.
 */
/*
 * Input Validation Utility Module
 *
 * This module provides common input validation functions used across multiple
 * modules to avoid code duplication and ensure consistent validation logic.
 * 
 * DESIGN PHILOSOPHY:
 * - Centralize validation logic to reduce duplication
 * - Provide consistent validation behavior across modules
 * - Return boolean values for simple integration
 * - Handle edge cases gracefully

 * QGenUtils Core Input Validation
 *
 * Provides shared helpers for confirming objects, strings and Express
 * response structures. These utilities support the library's fail-fast
 * approach and return simple booleans so callers can branch quickly.
 * Unexpected input is logged with qerrors to aid debugging without
 * throwing exceptions.

 */

const { qerrors } = require('qerrors'); // error logger used by validation helpers for consistent reporting

/**
 * Determine if the supplied value is a plain object.
 *
 * PURPOSE: Used by various validation helpers to confirm an argument is an
 * actual object before attempting to access its properties. Returning a simple
 * boolean allows the calling code to branch quickly without throwing errors.
 *
 * ASSUMPTIONS: Any type may be passed in. The function must therefore handle
 * null, undefined and Array values safely without throwing.
 *
 * EDGE CASES: We explicitly check for null and arrays so they are not treated
 * as valid objects. This prevents false positives when validating request
 * bodies or configuration parameters.
 *
 * @param {*} obj - Value to check
 * @returns {boolean} True if valid object, false otherwise
 */
function isValidObject(obj) {
  return obj !== null && obj !== undefined && typeof obj === 'object' && !Array.isArray(obj); // reject null and arrays so only plain objects pass
}

/**
 * Validate that the provided value is a non-empty string.
 *
 * PURPOSE: Many modules rely on simple string parameters such as IDs or
 * messages. A boolean return keeps caller logic straightforward.
 *
 * ASSUMPTIONS: Any value may be passed, so we handle non-string types and trim
 * whitespace to ensure that strings containing only spaces are rejected.
 *
 * EDGE CASES: null, numbers or objects are all rejected. Trimming prevents
 * "  " from being considered a valid string.
 *
 * @param {*} str - Value to check
 * @returns {boolean} True if valid string, false otherwise
 */
function isValidString(str) {
  return typeof str === 'string' && str.trim().length > 0; // empty or whitespace strings are treated as missing
}

/**
 * Test whether an object exposes a given method.
 *
 * PURPOSE: Safely verifies that an object provides a callable function before
 * invoking it elsewhere. This keeps calling code short with simple if checks.
 *
 * ASSUMPTIONS: obj may be anything (including proxies) so property access is
 * wrapped in a try/catch. Returning false on exceptions avoids crashing the
 * caller when an unexpected value is supplied.
 *
 * EDGE CASES: null objects or missing methods return false. Errors thrown by
 * property access are caught and logged via qerrors to aid debugging.
 *
 * @param {*} obj - Object to check
 * @param {string} methodName - Name of method to check for
 * @returns {boolean} True if object has method, false otherwise
 */
function hasMethod(obj, methodName) {
  try {
    return !!(obj && typeof obj[methodName] === 'function'); // double negation guarantees true only when callable exists
  } catch (error) {
    qerrors(error, 'hasMethod', { obj: typeof obj, methodName }); // record unexpected property access failure
    return false; // fail closed so callers don't attempt to call missing method
  }
}

/**
 * Verify that a value resembles an Express response object.
 *
 * PURPOSE: Many utilities need to send HTTP responses but should gracefully
 * bail out if the response object is missing or malformed. A boolean return
 * allows quick validation without throwing.
 *
 * ASSUMPTIONS: res may be anything; we simply check for the presence of the
 * status() and json() methods that Express provides.
 *
 * EDGE CASES: If either method is missing, hasMethod returns false, preventing
 * attempts to call undefined functions which would otherwise throw.
 *
 * @param {*} res - Value to check
 * @returns {boolean} True if valid Express response, false otherwise
 */
function isValidExpressResponse(res) {
  return hasMethod(res, 'status') && hasMethod(res, 'json'); // both Express methods must be functions
}

module.exports = {
  isValidObject, // export object validator
  isValidString, // export string validator
  hasMethod, // export method checker
  isValidExpressResponse // export Express response checker
}; // export validators as a group
