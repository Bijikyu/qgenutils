/**
 * Validate Date Object for Valid Date Values
 * 
 * RATIONALE: Date validation is needed across multiple datetime utilities to ensure
 * consistent handling of invalid dates and prevent runtime errors. Centralizing this
 * logic eliminates code duplication and ensures uniform validation behavior.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Check for proper Date object type
 * - Validate that the date represents a real date (not NaN)
 * - Handle edge cases like "Invalid Date" strings
 * - Provide clear boolean result for easy conditional logic
 * 
 * VALIDATION RULES:
 * - Input must be a Date object (not string or other types)
 * - Date.getTime() must not return NaN
 * - Date.toString() must not return "Invalid Date"
 * - Null and undefined inputs return false
 * 
 * @param {Date} date - Date object to validate
 * @returns {boolean} True if date is a valid Date object with valid date value
 * @throws Never throws - all edge cases handled gracefully
 */

// 🔗 Tests: isValidDate → date validation → datetime utilities
// Defensive require for qerrors to prevent test environment failures
let qerrors;
try {
  const qerrorsModule = require(`qerrors`);
  qerrors = qerrorsModule && qerrorsModule.qerrors ? qerrorsModule.qerrors : (qerrorsModule && qerrorsModule.default) ? qerrorsModule.default : qerrorsModule;
} catch (err) {
  // Provide a no-op fallback so tests won't fail if qerrors is absent
  qerrors = function () { /* no-op error reporter for test envs */ };
}

function isValidDate(date) {
  try {
    // Check if input is actually a Date object
    if (!(date instanceof Date)) {
      return false;
    }
    
    // Check if the date value is valid (not NaN)
    if (isNaN(date.getTime())) {
      return false;
    }
    
    // Check for "Invalid Date" string representation
    if (date.toString() === `Invalid Date`) {
      return false;
    }
    
    return true;
  } catch (error) {
    // Log validation attempt failures but return false gracefully
    qerrors(error, `isValidDate`, { 
      inputType: typeof date,
      isDateObject: date instanceof Date
    });
    return false;
  }
}

module.exports = isValidDate;