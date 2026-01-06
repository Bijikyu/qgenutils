/**
 * Centralized Input Validation Utilities for Consistent Input Handling
 * 
 * PURPOSE: Provides standardized input validation across all utility functions,
 * eliminating duplicate validation code and ensuring consistent validation
 * behavior and error handling throughout the codebase.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Centralize type checking and validation logic
 * - Standardize validation warning messages
 * - Provide consistent fallback value handling
 * - Support complex validation scenarios
 * - Maintain type safety for validation results
 * 
 * USAGE PATTERNS:
 * - Replace repetitive input validation across utilities
 * - Standardize validation logging format
 * - Ensure consistent validation behavior
 * - Reduce code duplication in validation logic
 * 
 * @param input - Input value to validate
 * @param expectedType - Expected type as string
 * @param functionName - Name of the function performing validation
 * @param fallbackValue - Safe fallback value to return
 * @returns Validation result with isValid flag and processed value
 */

import logger from '../../logger.js';

export interface ValidationResult<T> {
  isValid: boolean;
  value: T;
  originalInput: any;
}

/**
 * Generic input validation with type checking and fallback handling
 * 
 * @param input - Input value to validate
 * @param expectedType - Expected type ('string', 'number', 'boolean', 'object')
 * @param functionName - Name of the function performing validation
 * @param fallbackValue - Safe fallback value to return for invalid input
 * @returns Validation result with processed value or fallback
 */
export function validateInput<T>(
  input: any, 
  expectedType: string, 
  functionName: string, 
  fallbackValue: T
): ValidationResult<T> {
  // Check for null/undefined input
  if (input == null) {
    logger.warn(`${functionName} received null/undefined input`, { 
      input, 
      type: typeof input,
      expectedType 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  // Check type match
  if (typeof input !== expectedType) {
    logger.warn(`${functionName} received invalid type input`, { 
      input, 
      type: typeof input,
      expectedType 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  return {
    isValid: true,
    value: input as T,
    originalInput: input
  };
}

/**
 * String-specific validation with additional checks
 * 
 * @param input - Input value to validate as string
 * @param functionName - Name of the function performing validation
 * @param fallbackValue - Safe fallback string value
 * @param options - Additional validation options
 * @returns Validation result for string input
 */
export function validateString(
  input: any,
  functionName: string,
  fallbackValue: string,
  options: { allowEmpty?: boolean; trim?: boolean } = {}
): ValidationResult<string> {
  const { allowEmpty = true, trim = false } = options;
  
  // Handle null/undefined
  if (input == null) {
    logger.warn(`${functionName} received null/undefined string input`, { 
      input, 
      type: typeof input 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  // Convert to string if possible
  let strValue: string;
  switch (typeof input) {
    case 'string':
      strValue = input;
      break;
    case 'number':
    case 'boolean':
      strValue = String(input);
      break;
    default:
      logger.warn(`${functionName} received non-convertible string input`, { 
        input, 
        type: typeof input 
      });
      return {
        isValid: false,
        value: fallbackValue,
        originalInput: input
      };
  }
  
  // Apply trimming if requested
  if (trim) {
    strValue = strValue.trim();
  }
  
  // Check empty string validation
  if (!allowEmpty && strValue === '') {
    logger.warn(`${functionName} received empty string input`, { 
      originalInput: input,
      trimmed: trim 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  return {
    isValid: true,
    value: strValue,
    originalInput: input
  };
}

/**
 * Number-specific validation with range checking
 * 
 * @param input - Input value to validate as number
 * @param functionName - Name of the function performing validation
 * @param fallbackValue - Safe fallback number value
 * @param options - Additional validation options
 * @returns Validation result for number input
 */
export function validateNumber(
  input: any,
  functionName: string,
  fallbackValue: number,
  options: { min?: number; max?: number; allowNaN?: boolean } = {}
): ValidationResult<number> {
  const { min, max, allowNaN = false } = options;
  
  // Handle null/undefined
  if (input == null) {
    logger.warn(`${functionName} received null/undefined number input`, { 
      input, 
      type: typeof input 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  // Check type and convert if possible
  let numValue: number;
  if (typeof input === 'number') {
    numValue = input;
  } else if (typeof input === 'string') {
    const parsed = parseFloat(input);
    if (isNaN(parsed)) {
      logger.warn(`${functionName} received non-numeric string input`, { 
        input, 
        type: typeof input 
      });
      return {
        isValid: false,
        value: fallbackValue,
        originalInput: input
      };
    }
    numValue = parsed;
  } else {
    logger.warn(`${functionName} received non-convertible number input`, { 
      input, 
      type: typeof input 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  // Check NaN validation
  if (!allowNaN && isNaN(numValue)) {
    logger.warn(`${functionName} received NaN input`, { 
      input: numValue,
      originalInput: input 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  // Check range validation
  if ((min !== undefined && numValue < min) || (max !== undefined && numValue > max)) {
    logger.warn(`${functionName} received number outside valid range`, { 
      value: numValue,
      min,
      max,
      originalInput: input 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  return {
    isValid: true,
    value: numValue,
    originalInput: input
  };
}

/**
 * Array-specific validation with length checking
 * 
 * @param input - Input value to validate as array
 * @param functionName - Name of the function performing validation
 * @param fallbackValue - Safe fallback array value
 * @param options - Additional validation options
 * @returns Validation result for array input
 */
export function validateArray<T>(
  input: any,
  functionName: string,
  fallbackValue: T[],
  options: { minLength?: number; maxLength?: number } = {}
): ValidationResult<T[]> {
  const { minLength, maxLength } = options;
  
  // Handle null/undefined
  if (input == null) {
    logger.warn(`${functionName} received null/undefined array input`, { 
      input, 
      type: typeof input 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  // Check if it's an array
  if (!Array.isArray(input)) {
    logger.warn(`${functionName} received non-array input`, { 
      input, 
      type: typeof input 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  // Check length validation
  if ((minLength !== undefined && input.length < minLength) || 
      (maxLength !== undefined && input.length > maxLength)) {
    logger.warn(`${functionName} received array with invalid length`, { 
      length: input.length,
      minLength,
      maxLength,
      originalInput: input 
    });
    return {
      isValid: false,
      value: fallbackValue,
      originalInput: input
    };
  }
  
  return {
    isValid: true,
    value: input as T[],
    originalInput: input
  };
}