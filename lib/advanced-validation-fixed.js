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
 */
function validateEmail(email) {
  console.log(`validateEmail is running with email: ${email}`);
  
  if (!email || typeof email !== 'string') {
    const errorMsg = "Email address is required";
    console.log(`validateEmail is returning error: ${errorMsg}`);
    qerrors(new Error('Email validation failed - missing or invalid input'), 'validateEmail', {
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
    qerrors(new Error('Email validation failed - empty after sanitization'), 'validateEmail', {
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
    qerrors(new Error('Email validation failed - invalid format'), 'validateEmail', {
      sanitizedEmail,
      errorMsg,
      pattern: emailRegex.toString()
    });
    return errorMsg;
  }
  
  console.log(`validateEmail is returning success (empty string)`);
  qerrors(new Error('Email validation succeeded'), 'validateEmail', {
    sanitizedEmail
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Validates required text fields with optional minimum length
 */
function validateRequired(value, fieldName, minLength = 1) {
  console.log(`validateRequired is running with value: ${value}, fieldName: ${fieldName}, minLength: ${minLength}`);
  
  if (!value || typeof value !== 'string') {
    const errorMsg = `${fieldName} is required`;
    console.log(`validateRequired is returning error: ${errorMsg}`);
    qerrors(new Error('Required field validation failed - missing or invalid input'), 'validateRequired', {
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
    qerrors(new Error('Required field validation failed - empty after sanitization'), 'validateRequired', {
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
    qerrors(new Error('Required field validation failed - insufficient length'), 'validateRequired', {
      sanitizedValue,
      fieldName,
      actualLength: sanitizedValue.trim().length,
      minLength,
      errorMsg
    });
    return errorMsg;
  }
  
  console.log(`validateRequired is returning success (empty string)`);
  qerrors(new Error('Required field validation succeeded'), 'validateRequired', {
    sanitizedValue,
    fieldName,
    actualLength: sanitizedValue.trim().length,
    minLength
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Validates text fields with maximum length constraints
 */
function validateMaxLength(value, fieldName, maxLength) {
  console.log(`validateMaxLength is running with value length: ${value?.length}, fieldName: ${fieldName}, maxLength: ${maxLength}`);
  
  if (!value || typeof value !== 'string') {
    console.log(`validateMaxLength is returning success (empty string) - no value to validate`);
    qerrors(new Error('Max length validation skipped - no value provided'), 'validateMaxLength', {
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
    qerrors(new Error('Max length validation failed - value too long'), 'validateMaxLength', {
      sanitizedValue,
      fieldName,
      actualLength: sanitizedValue.length,
      maxLength,
      errorMsg
    });
    return errorMsg;
  }
  
  console.log(`validateMaxLength is returning success (empty string)`);
  qerrors(new Error('Max length validation succeeded'), 'validateMaxLength', {
    sanitizedValue,
    fieldName,
    actualLength: sanitizedValue.length,
    maxLength
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Validates that a selection has been made from a dropdown or select field
 */
function validateSelection(value, fieldName) {
  console.log(`validateSelection is running with value: ${value}, fieldName: ${fieldName}`);
  
  if (!value || typeof value !== 'string') {
    const errorMsg = `Please select a ${fieldName.toLowerCase()}`;
    console.log(`validateSelection is returning error: ${errorMsg}`);
    qerrors(new Error('Selection validation failed - missing or invalid input'), 'validateSelection', {
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
    qerrors(new Error('Selection validation failed - empty after sanitization'), 'validateSelection', {
      originalValue: value,
      sanitizedValue,
      fieldName,
      errorMsg
    });
    return errorMsg;
  }
  
  console.log(`validateSelection is returning success (empty string)`);
  qerrors(new Error('Selection validation succeeded'), 'validateSelection', {
    sanitizedValue,
    fieldName
  });
  
  return ""; // Empty string indicates successful validation
}

/**
 * Combines multiple validation functions and returns the first error encountered
 */
function combineValidations(...validators) {
  console.log(`combineValidations is running with ${validators.length} validators`);
  
  qerrors(new Error('Starting combined validation'), 'combineValidations', {
    validatorCount: validators.length
  });
  
  for (let i = 0; i < validators.length; i++) {
    const validator = validators[i];
    
    if (typeof validator !== 'function') {
      const errorMsg = `Validator at index ${i} is not a function`;
      console.log(`combineValidations is returning error: ${errorMsg}`);
      qerrors(new Error('Combined validation failed - invalid validator'), 'combineValidations', {
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
        qerrors(new Error('Combined validation failed at validator'), 'combineValidations', {
          validatorIndex: i,
          errorMsg: error,
          totalValidators: validators.length
        });
        return error;
      }
    } catch (validationError) {
      const errorMsg = `Validation function ${i} threw an error: ${validationError.message}`;
      console.log(`combineValidations is returning error: ${errorMsg}`);
      qerrors(new Error('Combined validation failed - validator threw exception'), 'combineValidations', {
        validatorIndex: i,
        validationError: validationError.message,
        errorMsg
      });
      return errorMsg;
    }
  }
  
  console.log(`combineValidations is returning success (empty string) - all ${validators.length} validators passed`);
  qerrors(new Error('Combined validation succeeded'), 'combineValidations', {
    validatorCount: validators.length
  });
  
  return ""; // All validations passed
}

/**
 * Validate MongoDB ObjectId format
 */
function validateObjectId(id, fieldName = 'id') {
  console.log(`validateObjectId is running with id: ${id}, fieldName: ${fieldName}`);
  
  if (!id || typeof id !== 'string') {
    const errorMsg = `${fieldName} is required and must be a string.`;
    console.log(`validateObjectId is throwing error: ${errorMsg}`);
    qerrors(new Error('ObjectId validation failed - missing or invalid input'), 'validateObjectId', {
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
    qerrors(new Error('ObjectId validation failed - empty after sanitization'), 'validateObjectId', {
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
    qerrors(new Error('ObjectId validation failed - invalid format'), 'validateObjectId', {
      sanitizedId,
      fieldName,
      errorMsg,
      pattern: objectIdRegex.toString()
    });
    throw new Error(errorMsg);
  }
  
  console.log(`validateObjectId is returning: ${sanitizedId}`);
  qerrors(new Error('ObjectId validation succeeded'), 'validateObjectId', {
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