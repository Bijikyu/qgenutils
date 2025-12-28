/**
 * String Validation Utility - Non-Empty String Check
 * 
 * PURPOSE: Provides a reliable, performant check for non-empty string values.
 * This utility is essential for input validation, form processing, and data
 * sanitization where string content is required but empty strings should be rejected.
 * 
 * VALIDATION CRITERIA:
 * - Must be of type string (rejects numbers, objects, arrays, etc.)
 * - Must contain at least one non-whitespace character
 * - Handles strings with only whitespace (spaces, tabs, newlines) as invalid
 * - Preserves original string (no trimming/modification of input)
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Single pass type check for optimal performance
 * - Trim operation only after type confirmation (more efficient)
 * - Length check after trim to avoid string modification when unnecessary
 * - Suitable for high-frequency validation in data processing pipelines
 * 
 * COMMON USE CASES:
 * - Required field validation in forms
 * - Configuration value validation
 * - API parameter validation
 * - Database field validation before storage
 * - Data cleaning and preprocessing
 * 
 * SECURITY NOTES:
 * - Prevents processing of empty/whitespace-only malicious inputs
 * - Rejects non-string types that could cause injection vulnerabilities
 * - Safe for use in security-critical validation pipelines
 * - Does not modify input, preventing side effects
 * 
 * @param {any} value - Value to validate (any type accepted, only strings pass)
 * @returns {boolean} True if value is a non-empty string with visible characters,
 *                    false for all other types and empty/whitespace-only strings
 * 
 * @example
 * // Valid non-empty strings
 * isValidString('hello');        // true
 * isValidString('  test  ');      // true (has visible characters)
 * isValidString('\ncontent\n');   // true (non-whitespace characters)
 * 
 * @example
 * // Invalid strings
 * isValidString('');              // false (empty)
 * isValidString('   ');           // false (whitespace only)
 * isValidString('\n\t \r');       // false (whitespace only)
 * 
 * @example
 * // Non-string types
 * isValidString(123);            // false (number)
 * isValidString(null);            // false (null)
 * isValidString(undefined);        // false (undefined)
 * isValidString({});              // false (object)
 * isValidString([]);              // false (array)
 */
const isValidString = (value: any): boolean => typeof value === 'string' && value.trim().length > 0;

export default isValidString;
