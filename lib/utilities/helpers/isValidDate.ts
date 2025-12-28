/**
 * Date Validation Utility - Valid Date Object Check
 * 
 * PURPOSE: Provides reliable validation for Date objects, distinguishing between
 * actual valid dates and invalid Date instances that can occur from parsing errors
 * or incorrect construction. This is critical for date processing, validation,
 * and storage operations where invalid dates can cause data corruption or runtime errors.
 * 
 * DATE VALIDATION CHALLENGES:
 * - Date constructor can create "Invalid Date" objects without throwing
 * - Date parsing failures return Date objects that are actually invalid
 * - typeof invalid Date is still "object", requiring instanceof check
 * - Invalid dates have NaN getTime() values, needing special detection
 * - Date manipulation with invalid dates can cause cascading errors
 * 
 * VALIDATION STRATEGY:
 * - First check if value is instance of Date (excludes strings, numbers, objects)
 * - Then check getTime() returns finite number (NaN indicates invalid date)
 * - This two-step approach prevents false positives from date-like objects
 * - Handles edge cases like new Date('invalid') which returns Invalid Date
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - instanceof check is fast and reliable for type validation
 * - getTime() is native method with optimal performance
 * - Short-circuit evaluation (&&) prevents getTime() on non-Date objects
 * - Suitable for high-frequency date validation in data processing
 * 
 * COMMON FAILURE SCENARIOS:
 * - new Date('invalid string') → Invalid Date object
 * - new Date('') → Invalid Date object
 * - new Date(undefined) → Invalid Date object
 * - Date.parse failure cases
 * - Date manipulation overflow errors
 * 
 * USE CASES:
 * - Input validation for date fields in forms
 * - API parameter validation for date ranges
 * - Database date field validation before storage
 * - Date range processing and filtering
 * - Calendar and scheduling applications
 * - Data import/export validation
 * 
 * SECURITY CONSIDERATIONS:
 * - Prevents processing of malformed dates that could cause application errors
 * - Validates date objects before calculations to prevent time-based attacks
 * - Safe for use in financial calculations where date validity is critical
 * - Handles malicious date input attempts gracefully
 * 
 * @param {unknown} value - Value to validate (any type accepted, only valid Date objects pass)
 * @returns {boolean} True if value is a valid Date object with finite time value,
 *                    false for invalid Date objects and all other types
 * 
 * @example
 * // Valid dates
 * isValidDate(new Date());                    // true
 * isValidDate(new Date('2023-12-25'));        // true
 * isValidDate(new Date('2023-12-25T10:30:00Z')); // true
 * 
 * @example
 * // Invalid dates (Date objects that failed parsing)
 * isValidDate(new Date('invalid'));             // false
 * isValidDate(new Date(''));                   // false
 * isValidDate(new Date(undefined));             // false
 * 
 * @example
 * // Non-date types
 * isValidDate('2023-12-25');                 // false (string)
 * isValidDate(1703505000000);                 // false (number)
 * isValidDate({ year: 2023, month: 12 });      // false (object)
 * isValidDate(null);                          // false
 * isValidDate(undefined);                      // false
 */
const isValidDate: any = (value: unknown): boolean => value instanceof Date && !isNaN(value.getTime());

export default isValidDate;
