/**
 * Common Validation Utilities
 *
 * Centralized validation functions to eliminate code duplication across
 * the codebase. These utilities handle common validation patterns including
 * type checking, null/undefined validation, string validation, and more.
 */

/**
 * Validates if a value is null or undefined
 * @param value - Value to check
 * @returns True if value is null or undefined
 */
export function isNullOrUndefined(value: any): boolean {
  return value == null;
}

/**
 * Validates if a value is null, undefined, or empty string
 * @param value - Value to check
 * @returns True if value is null, undefined, or empty
 */
export function isNullOrEmpty(value: any): boolean {
  return isNullOrUndefined(value) || value === '';
}

/**
 * Validates if a value is of a specific type
 * @param value - Value to check
 * @param type - Expected type
 * @returns True if value matches the expected type
 */
export function validateType(value: any, type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function'): boolean {
  switch (type) {
  case 'string':
    return typeof value === 'string';
  case 'number':
    return typeof value === 'number' && !isNaN(value);
  case 'boolean':
    return typeof value === 'boolean';
  case 'object':
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  case 'array':
    return Array.isArray(value);
  case 'function':
    return typeof value === 'function';
  default:
    return false;
  }
}

/**
 * Validates and trims a string value
 * @param value - Value to validate and trim
 * @param options - Validation options
 * @returns Validated and trimmed string
 */
export function validateAndTrimString(value: any, options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  allowEmpty?: boolean;
} = {}): string {
  const { required = false, minLength = 0, maxLength = 1000, allowEmpty = false } = options;

  // Check for null/undefined
  if (isNullOrUndefined(value)) {
    if (required) {
      throw new Error('Value is required');
    }
    return '';
  }

  // Convert to string
  const strValue = String(value);
  const trimmedValue = strValue.trim();

  // Check if empty string is allowed
  if (!allowEmpty && trimmedValue === '') {
    if (required) {
      throw new Error('Value cannot be empty');
    }
    return '';
  }

  // Length validation
  if (trimmedValue.length < minLength) {
    throw new Error(`Value must be at least ${minLength} characters long`);
  }

  if (trimmedValue.length > maxLength) {
    throw new Error(`Value cannot exceed ${maxLength} characters`);
  }

  return trimmedValue;
}

/**
 * Validates an object and checks for prototype pollution
 * @param value - Value to validate
 * @param options - Validation options
 * @returns Validated object
 */
export function validateObject(value: any, options: {
  required?: boolean;
  checkPrototypePollution?: boolean;
} = {}): Record<string, any> {
  const { required = false, checkPrototypePollution = true } = options;

  // Check for null/undefined
  if (isNullOrUndefined(value)) {
    if (required) {
      throw new Error('Object is required');
    }
    return {};
  }

  // Type validation
  if (!validateType(value, 'object')) {
    throw new Error('Value must be an object');
  }

  // Prototype pollution check
  if (checkPrototypePollution && hasPrototypePollution(value)) {
    throw new Error('Object contains prototype pollution risk');
  }

  return value;
}

/**
 * Checks for prototype pollution in objects
 * @param obj - Object to check
 * @returns True if prototype pollution is detected
 */
export function hasPrototypePollution(obj: any): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  for (const key of Object.keys(obj)) {
    if (dangerousKeys.includes(key)) {
      return true;
    }

    if (typeof obj[key] === 'object' && hasPrototypePollution(obj[key])) {
      return true;
    }
  }

  return false;
}

/**
 * Validates email format using common patterns
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!validateType(email, 'string')) {
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export function validateUrl(url: string): boolean {
  if (!validateType(url, 'string')) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a number within a specific range
 * @param value - Value to validate
 * @param options - Validation options
 * @returns Validated number
 */
export function validateNumber(value: any, options: {
  required?: boolean;
  min?: number;
  max?: number;
  allowZero?: boolean;
  allowNegative?: boolean;
} = {}): number {
  const { required = false, min, max, allowZero = true, allowNegative = true } = options;

  // Check for null/undefined
  if (isNullOrUndefined(value)) {
    if (required) {
      throw new Error('Number is required');
    }
    return 0;
  }

  // Type validation
  if (!validateType(value, 'number')) {
    throw new Error('Value must be a number');
  }

  // NaN check
  if (isNaN(value)) {
    throw new Error('Value cannot be NaN');
  }

  // Zero validation
  if (!allowZero && value === 0) {
    throw new Error('Value cannot be zero');
  }

  // Negative validation
  if (!allowNegative && value < 0) {
    throw new Error('Value cannot be negative');
  }

  // Range validation
  if (min !== undefined && value < min) {
    throw new Error(`Value must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    throw new Error(`Value cannot exceed ${max}`);
  }

  return value;
}

/**
 * Validates an array with specific constraints
 * @param value - Value to validate
 * @param options - Validation options
 * @returns Validated array
 */
export function validateArray(value: any, options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  itemValidator?: (item: any) => boolean;
} = {}): any[] {
  const { required = false, minLength = 0, maxLength = 1000, itemValidator } = options;

  // Check for null/undefined
  if (isNullOrUndefined(value)) {
    if (required) {
      throw new Error('Array is required');
    }
    return [];
  }

  // Type validation
  if (!validateType(value, 'array')) {
    throw new Error('Value must be an array');
  }

  // Length validation
  if (value.length < minLength) {
    throw new Error(`Array must contain at least ${minLength} items`);
  }

  if (value.length > maxLength) {
    throw new Error(`Array cannot exceed ${maxLength} items`);
  }

  // Item validation
  if (itemValidator) {
    for (let i = 0; i < value.length; i++) {
      if (!itemValidator(value[i])) {
        throw new Error(`Item at index ${i} failed validation`);
      }
    }
  }

  return value;
}

/**
 * Validates a value against a regular expression pattern
 * @param value - Value to validate
 * @param pattern - Regular expression pattern
 * @param options - Validation options
 * @returns Validated string
 */
export function validatePattern(value: any, pattern: RegExp, options: {
  required?: boolean;
  errorMessage?: string;
} = {}): string {
  const { required = false, errorMessage = 'Value does not match required pattern' } = options;

  // Check for null/undefined
  if (isNullOrUndefined(value)) {
    if (required) {
      throw new Error('Value is required');
    }
    return '';
  }

  // Convert to string and test pattern
  const strValue = String(value);

  if (!pattern.test(strValue)) {
    throw new Error(errorMessage);
  }

  return strValue;
}

/**
 * Creates a validator function for required fields
 * @param validator - Base validator function
 * @returns Validator function that throws for missing values
 */
export function createRequiredValidator<T>(validator: (value: any) => T): (value: any) => T {
  return (value: any): T => {
    if (isNullOrEmpty(value)) {
      throw new Error('Field is required');
    }
    return validator(value);
  };
}

/**
 * Creates a conditional validator that applies different validation based on conditions
 * @param conditions - Array of condition-validator pairs
 * @returns Conditional validator function
 */
export function createConditionalValidator(
  conditions: Array<{
    condition: (value: any) => boolean;
    validator: (value: any) => any;
  }>
): (value: any) => any {
  return (value: any): any => {
    for (const { condition, validator } of conditions) {
      if (condition(value)) {
        return validator(value);
      }
    }
    throw new Error('No validation condition matched');
  };
}
