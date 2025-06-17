/**
 * Advanced Validation Utilities
 * 
 * RATIONALE: Applications require comprehensive field validation beyond basic
 * type checking. This module provides validation for common field types with
 * consistent error messaging and security-first sanitization patterns.
 * 
 * SECURITY MODEL: Fail-fast validation with detailed error reporting to help
 * users correct input while preventing malformed data from entering the system.
 * All validation functions sanitize input and log operations for security auditing.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Leverage existing string sanitization utilities for consistency
 * - Provide validation functions that return error messages (empty string = valid)
 * - Support validation combining for complex field requirements
 * - Log all validation attempts for debugging and security monitoring
 * - Follow established codebase patterns for error handling and logging
 */

const { qerrors } = require('qerrors');
const { sanitizeString } = require('./string-utils');

/**
 * Validates email address format using standard email regex
 * 
 * RATIONALE: Email validation ensures notification delivery and prevents
 * database corruption from malformed email addresses. This function uses
 * industry-standard regex patterns for reliable validation.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Apply string sanitization first for security
 * - Use proven email regex pattern that handles most valid cases
 * - Provide clear error messages for different failure modes
 * - Log validation attempts for monitoring email collection quality
 * - Return empty string for success to match validation pattern
 * 
 * EMAIL VALIDATION PATTERN:
 * /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 * - [^\s@]+ : Local part (no spaces or @ symbols)
 * - @ : Required @ symbol separator
 * - [^\s@]+ : Domain name (no spaces or @ symbols)
 * - \. : Required dot before TLD
 * - [^\s@]+ : Top-level domain (no spaces or @ symbols)
 * 
 * @param {string} email - The email address to validate
 * @returns {string} Empty string if valid, error message if invalid
 * 
 * USAGE EXAMPLES:
 * validateEmail("user@example.com")        // Returns ""
 * validateEmail("user.name@domain.co.uk")  // Returns ""
 * validateEmail("")                        // Returns "Email address is required"
 * validateEmail("invalid-email")           // Returns "Please enter a valid email address"
 * validateEmail("user@")                   // Returns "Please enter a valid email address"
 */
function validateEmail(email) {
  console.log(`validateEmail is running with email: ${email}`);
  
  if (!email || typeof email !== 'string') {
    const errorMsg = "Email address is required";
    console.log(`validateEmail is returning error: ${errorMsg}`);
    qerrors('Email validation failed - missing or invalid input', 'validateEmail', {
      email,
      inputType: typeof email,
      errorMsg
    });
    return errorMsg;
  }
  
  const sanitizedEmail = sanitizeString(email);
  
  if (!sanitizedEmail.trim()) {
    const errorMsg = "Email address is required";
    console.log(`validateEmail is returning error: ${errorMsg}`);
    qerrors('Email validation failed - empty after sanitization', 'validateEmail', {
      originalEmail: email,
      sanitizedEmail,
      errorMsg
    });
    return errorMsg;
  }
  
  // Standard email regex pattern that handles most common valid email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    const errorMsg = "Please enter a valid email address";
    console.log(`validateEmail is returning error: ${errorMsg}`);
    qerrors('Email validation failed - invalid format', 'validateEmail', {
      sanitizedEmail,
      errorMsg,
      pattern: emailRegex.toString()
    });
    return errorMsg;
  }
  
  console.log(`validateEmail is returning success (empty string)`);
  qerrors('Email validation succeeded', 'validateEmail', {
    sanitizedEmail
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Validates required text fields with optional minimum length
 * 
 * RATIONALE: Most form fields require non-empty values with minimum length
 * requirements. This function provides consistent validation for required
 * fields while supporting customizable requirements.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Apply string sanitization first for security
 * - Check for empty values after sanitization
 * - Validate minimum length requirements
 * - Provide specific error messages with field context
 * - Support custom field names for better user experience
 * 
 * @param {string} value - The field value to validate
 * @param {string} fieldName - Human-readable field name for error messages
 * @param {number} minLength - Optional minimum length requirement (default: 1)
 * @returns {string} Empty string if valid, error message if invalid
 * 
 * USAGE EXAMPLES:
 * validateRequired("John", "Name")                    // Returns ""
 * validateRequired("", "Name")                        // Returns "Name is required"
 * validateRequired("ab", "Username", 3)               // Returns "Username must be at least 3 characters long"
 * validateRequired("valid", "Title", 5)               // Returns ""
 */
function validateRequired(value, fieldName, minLength = 1) {
  console.log(`validateRequired is running with value: ${value}, fieldName: ${fieldName}, minLength: ${minLength}`);
  
  if (!value || typeof value !== 'string') {
    const errorMsg = `${fieldName} is required`;
    console.log(`validateRequired is returning error: ${errorMsg}`);
    qerrors('Required field validation failed - missing or invalid input', 'validateRequired', {
      value,
      fieldName,
      minLength,
      inputType: typeof value,
      errorMsg
    });
    return errorMsg;
  }
  
  const sanitizedValue = sanitizeString(value);
  
  if (!sanitizedValue.trim()) {
    const errorMsg = `${fieldName} is required`;
    console.log(`validateRequired is returning error: ${errorMsg}`);
    qerrors('Required field validation failed - empty after sanitization', 'validateRequired', {
      originalValue: value,
      sanitizedValue,
      fieldName,
      minLength,
      errorMsg
    });
    return errorMsg;
  }
  
  if (sanitizedValue.trim().length < minLength) {
    const errorMsg = `${fieldName} must be at least ${minLength} character${minLength === 1 ? '' : 's'} long`;
    console.log(`validateRequired is returning error: ${errorMsg}`);
    qerrors('Required field validation failed - insufficient length', 'validateRequired', {
      sanitizedValue,
      fieldName,
      actualLength: sanitizedValue.trim().length,
      minLength,
      errorMsg
    });
    return errorMsg;
  }
  
  console.log(`validateRequired is returning success (empty string)`);
  qerrors('Required field validation succeeded', 'validateRequired', {
    sanitizedValue,
    fieldName,
    actualLength: sanitizedValue.trim().length,
    minLength
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Validates text fields with maximum length constraints
 * 
 * RATIONALE: Database schemas and API limits often impose maximum length
 * constraints on text fields. This function ensures form data fits within
 * those constraints before submission.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Apply string sanitization for security consistency
 * - Check length against maximum constraint
 * - Provide specific error messages with actual vs. allowed lengths
 * - Support custom field names for user-friendly error messages
 * - Log validation attempts for monitoring data patterns
 * 
 * @param {string} value - The field value to validate
 * @param {string} fieldName - Human-readable field name for error messages
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Empty string if valid, error message if invalid
 * 
 * USAGE EXAMPLES:
 * validateMaxLength("Short", "Title", 100)           // Returns ""
 * validateMaxLength("Very long text...", "Title", 10) // Returns "Title cannot exceed 10 characters"
 * validateMaxLength("", "Description", 500)          // Returns "" (empty is valid for max length)
 */
function validateMaxLength(value, fieldName, maxLength) {
  console.log(`validateMaxLength is running with value length: ${value?.length}, fieldName: ${fieldName}, maxLength: ${maxLength}`);
  
  if (!value || typeof value !== 'string') {
    console.log(`validateMaxLength is returning success (empty string) - no value to validate`);
    qerrors('Max length validation skipped - no value provided', 'validateMaxLength', {
      value,
      fieldName,
      maxLength,
      inputType: typeof value
    });
    return ""; // No value to validate against max length
  }
  
  const sanitizedValue = sanitizeString(value);
  
  if (sanitizedValue.length > maxLength) {
    const errorMsg = `${fieldName} cannot exceed ${maxLength} characters`;
    console.log(`validateMaxLength is returning error: ${errorMsg}`);
    qerrors('Max length validation failed - value too long', 'validateMaxLength', {
      sanitizedValue,
      fieldName,
      actualLength: sanitizedValue.length,
      maxLength,
      errorMsg
    });
    return errorMsg;
  }
  
  console.log(`validateMaxLength is returning success (empty string)`);
  qerrors('Max length validation succeeded', 'validateMaxLength', {
    sanitizedValue,
    fieldName,
    actualLength: sanitizedValue.length,
    maxLength
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Validates that a selection has been made from a dropdown or select field
 * 
 * RATIONALE: Form interfaces often require users to make selections from
 * predefined options. This function ensures required selections are not
 * left empty or set to placeholder values.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Apply string sanitization for consistency
 * - Check for empty or whitespace-only values
 * - Provide user-friendly error messages with field context
 * - Support custom field names for better error messaging
 * - Log validation attempts for monitoring form completion patterns
 * 
 * @param {string} value - The selected value to validate
 * @param {string} fieldName - Human-readable field name for error messages
 * @returns {string} Empty string if valid, error message if invalid
 * 
 * USAGE EXAMPLES:
 * validateSelection("option1", "Category")      // Returns ""
 * validateSelection("", "Priority")             // Returns "Please select a priority"
 * validateSelection("   ", "Status")            // Returns "Please select a status"
 * validateSelection("none", "Type")             // Returns ""
 */
function validateSelection(value, fieldName) {
  console.log(`validateSelection is running with value: ${value}, fieldName: ${fieldName}`);
  
  if (!value || typeof value !== 'string') {
    const errorMsg = `Please select a ${fieldName.toLowerCase()}`;
    console.log(`validateSelection is returning error: ${errorMsg}`);
    qerrors('Selection validation failed - missing or invalid input', 'validateSelection', {
      value,
      fieldName,
      inputType: typeof value,
      errorMsg
    });
    return errorMsg;
  }
  
  const sanitizedValue = sanitizeString(value);
  
  if (!sanitizedValue || sanitizedValue.trim() === "") {
    const errorMsg = `Please select a ${fieldName.toLowerCase()}`;
    console.log(`validateSelection is returning error: ${errorMsg}`);
    qerrors('Selection validation failed - empty after sanitization', 'validateSelection', {
      originalValue: value,
      sanitizedValue,
      fieldName,
      errorMsg
    });
    return errorMsg;
  }
  
  console.log(`validateSelection is returning success (empty string)`);
  qerrors('Selection validation succeeded', 'validateSelection', {
    sanitizedValue,
    fieldName
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Combines multiple validation functions and returns the first error encountered
 * 
 * RATIONALE: Complex fields often require multiple validation rules (required,
 * min length, max length, format). This function allows chaining multiple
 * validation rules for comprehensive field validation.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Accept array of validation functions that return error strings
 * - Execute validations in order and return first error found
 * - Support short-circuit evaluation for performance
 * - Log validation combination results for debugging
 * - Return empty string only when all validations pass
 * 
 * @param {...Function} validators - Array of validation functions that return error strings
 * @returns {string} Empty string if all validations pass, first error message if any fail
 * 
 * USAGE EXAMPLES:
 * combineValidations(
 *   () => validateRequired(username, "Username"),
 *   () => validateMaxLength(username, "Username", 50),
 *   () => validateEmail(email, "Email")
 * )
 * // Returns first error encountered, or "" if all pass
 * 
 * // Can also be used with arrow functions for complex validation
 * combineValidations(
 *   () => validateRequired(password, "Password", 8),
 *   () => password.includes('@') ? "" : "Password must contain @ symbol"
 * )
 */
function combineValidations(...validators) {
  console.log(`combineValidations is running with ${validators.length} validators`);
  
  qerrors('Starting combined validation', 'combineValidations', {
    validatorCount: validators.length
  });
  
  for (let i = 0; i < validators.length; i++) {
    const validator = validators[i];
    
    if (typeof validator !== 'function') {
      const errorMsg = `Validator at index ${i} is not a function`;
      console.log(`combineValidations is returning error: ${errorMsg}`);
      qerrors('Combined validation failed - invalid validator', 'combineValidations', {
        validatorIndex: i,
        validatorType: typeof validator,
        errorMsg
      });
      return errorMsg;
    }
    
    try {
      const error = validator();
      
      if (error && typeof error === 'string' && error.trim() !== '') {
        console.log(`combineValidations is returning error from validator ${i}: ${error}`);
        qerrors('Combined validation failed at validator', 'combineValidations', {
          validatorIndex: i,
          errorMsg: error,
          totalValidators: validators.length
        });
        return error;
      }
    } catch (validationError) {
      const errorMsg = `Validation function ${i} threw an error: ${validationError.message}`;
      console.log(`combineValidations is returning error: ${errorMsg}`);
      qerrors('Combined validation failed - validator threw exception', 'combineValidations', {
        validatorIndex: i,
        validationError: validationError.message,
        errorMsg
      });
      return errorMsg;
    }
  }
  
  console.log(`combineValidations is returning success (empty string) - all ${validators.length} validators passed`);
  qerrors('Combined validation succeeded', 'combineValidations', {
    validatorCount: validators.length
  });
  
  return ""; // All validations passed
}

/**
 * Validate MongoDB ObjectId format
 * 
 * RATIONALE: MongoDB applications frequently receive ObjectId strings that
 * must be validated before database operations. This function ensures IDs
 * match the expected 24-character hexadecimal format.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use regex pattern for exact ObjectId format matching
 * - Apply string sanitization for security consistency
 * - Provide specific error messages with field context
 * - Support custom field names for better error messaging
 * - Return validated string for immediate use in database operations
 * 
 * MONGODB OBJECTID FORMAT:
 * - Exactly 24 characters long
 * - Contains only hexadecimal characters (0-9, a-f, A-F)
 * - Case-insensitive validation but preserves original case
 * 
 * @param {string} id - The ObjectId string to validate
 * @param {string} fieldName - Field name for error messages (default: 'id')
 * @returns {string} Validated ObjectId string if valid, throws error if invalid
 * 
 * USAGE EXAMPLES:
 * validateObjectId("507f1f77bcf86cd799439011", "userId")     // Returns "507f1f77bcf86cd799439011"
 * validateObjectId("invalid", "postId")                      // Throws error
 * validateObjectId("", "commentId")                          // Throws error
 */
function validateObjectId(id, fieldName = 'id') {
  console.log(`validateObjectId is running with id: ${id}, fieldName: ${fieldName}`);
  
  if (!id || typeof id !== 'string') {
    const errorMsg = `${fieldName} is required and must be a string.`;
    console.log(`validateObjectId is throwing error: ${errorMsg}`);
    qerrors('ObjectId validation failed - missing or invalid input', 'validateObjectId', {
      id,
      fieldName,
      inputType: typeof id,
      errorMsg
    });
    throw new Error(errorMsg);
  }
  
  const sanitizedId = sanitizeString(id);
  
  if (!sanitizedId) {
    const errorMsg = `${fieldName} cannot be empty after sanitization.`;
    console.log(`validateObjectId is throwing error: ${errorMsg}`);
    qerrors('ObjectId validation failed - empty after sanitization', 'validateObjectId', {
      originalId: id,
      sanitizedId,
      fieldName,
      errorMsg
    });
    throw new Error(errorMsg);
  }
  
  // MongoDB ObjectId regex: exactly 24 hexadecimal characters
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  
  if (!objectIdRegex.test(sanitizedId)) {
    const errorMsg = `Invalid ${fieldName} format. Must be a valid MongoDB ObjectId.`;
    console.log(`validateObjectId is throwing error: ${errorMsg}`);
    qerrors('ObjectId validation failed - invalid format', 'validateObjectId', {
      sanitizedId,
      fieldName,
      errorMsg,
      pattern: objectIdRegex.toString()
    });
    throw new Error(errorMsg);
  }
  
  console.log(`validateObjectId is returning: ${sanitizedId}`);
  qerrors('ObjectId validation succeeded', 'validateObjectId', {
    originalId: id,
    sanitizedId,
    fieldName
  });
  
  return sanitizedId;
}

module.exports = {
  validateEmail,
  validateRequired,
  validateMaxLength,
  validateSelection,
  combineValidations,
  validateObjectId
};