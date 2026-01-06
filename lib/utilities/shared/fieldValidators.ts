/**
 * SHARED FIELD VALIDATOR UTILITIES
 * 
 * PURPOSE: Provides common field validation patterns used across the codebase.
 * This utility eliminates duplication of validation logic and ensures
 * consistent validation behavior throughout the application.
 * 
 * DESIGN PRINCIPLES:
 * - Centralized field validation logic
 * - Consistent error message formatting
 * - Flexible validation rule composition
 * - Performance optimized validation
 * - TypeScript compatible with proper type guards
 * 
 * USAGE PATTERNS:
 * - Field validation with error messages
 * - Rule composition and chaining
 * - Validation result objects
 * - Common validation patterns
 */

import { TypeValidators } from './typeValidators.js';
import { InputSanitizers } from './inputSanitizers.js';
import { ErrorHandlers } from './errorHandlers.js';
import logger from '../../logger.js';

/**
 * Validation rule interface for composing validators.
 */
export interface ValidationRule {
  /** The validation function to execute */
  validate: (value: any) => boolean | Promise<boolean>;
  /** Error message to use when validation fails */
  message: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Whether to stop validation on this rule failure (default: false) */
  stopOnFail?: boolean;
}

/**
 * Field validation result interface.
 */
export interface FieldValidationResult {
  /** Whether the field passed validation */
  isValid: boolean;
  /** The processed/sanitized value */
  value?: any;
  /** Array of validation errors */
  errors: ValidationError[];
  /** Any warnings generated during validation */
  warnings: string[];
}

/**
 * Validation error interface.
 */
export interface ValidationError {
  /** Error message */
  message: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Field name (if available) */
  field?: string;
  /** Validation context */
  context?: string;
}

/**
 * Field validator configuration options.
 */
export interface FieldValidatorOptions {
  /** Field name for error context */
  fieldName?: string;
  /** Whether to sanitize input before validation (default: true) */
  sanitize?: boolean;
  /** Whether to stop on first validation failure (default: false) */
  stopOnFirstError?: boolean;
  /** Custom error message prefix */
  errorPrefix?: string;
  /** Validation context for debugging */
  context?: string;
}

/**
 * Creates a field validator with the specified rules and options.
 * This is the core pattern used across the validation utilities.
 * 
 * @param rules - Array of validation rules to apply
 * @param options - Validator configuration options
 * @returns Field validator function
 * 
 * @example
 * ```typescript
 * const nameValidator = createFieldValidator([
 *   { validate: (v) => TypeValidators.isNonEmptyString(v), message: 'Name is required', code: 'REQUIRED' },
 *   { validate: (v) => v.length >= 2, message: 'Name must be at least 2 characters', code: 'TOO_SHORT' },
 *   { validate: (v) => v.length <= 50, message: 'Name must be 50 characters or less', code: 'TOO_LONG' }
 * ], { fieldName: 'name' });
 * 
 * const result = nameValidator('John');
 * // Returns: { isValid: true, value: 'John', errors: [], warnings: [] }
 * ```
 */
export const createFieldValidator = (
  rules: ValidationRule[],
  options: FieldValidatorOptions = {}
): (value: any) => FieldValidationResult => {
  const {
    fieldName = 'field',
    sanitize = true,
    stopOnFirstError = false,
    errorPrefix = '',
    context = ''
  } = options;

  return (value: any): FieldValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    let processedValue = value;

    try {
      // Sanitize input if requested
      if (sanitize && TypeValidators.isString(value)) {
        const sanitizationResult = InputSanitizers.sanitizeString(value, { trim: true });
        processedValue = sanitizationResult.value;
        warnings.push(...sanitizationResult.warnings);
      }

      // Apply validation rules
      for (const rule of rules) {
        try {
          const isValid = rule.validate(processedValue);
          
          if (!isValid) {
            const errorMessage = errorPrefix ? `${errorPrefix}: ${rule.message}` : rule.message;
            const error: ValidationError = {
              message: errorMessage,
              code: rule.code,
              field: fieldName,
              context: context || undefined
            };
            
            errors.push(error);
            
            if (rule.stopOnFail || stopOnFirstError) {
              break;
            }
          }
        } catch (error) {
          ErrorHandlers.handleError(error, {
            functionName: 'createFieldValidator',
            context: `Validating ${fieldName} with rule: ${rule.code || 'unknown'}`
          });
          
          errors.push({
            message: rule.message,
            code: rule.code || 'VALIDATION_ERROR',
            field: fieldName,
            context: context || undefined
          });
          
          if (rule.stopOnFail || stopOnFirstError) {
            break;
          }
        }
      }

      return {
        isValid: errors.length === 0,
        value: processedValue,
        errors,
        warnings
      };
    } catch (error) {
      ErrorHandlers.handleError(error, {
        functionName: 'createFieldValidator',
        context: `Validating field: ${fieldName}`
      });
      
      return {
        isValid: false,
        value: processedValue,
        errors: [{
          message: `${errorPrefix}Validation failed for ${fieldName}`,
          code: 'VALIDATION_ERROR',
          field: fieldName,
          context: context || undefined
        }],
        warnings
      };
    }
  };
};

/**
 * Common validation rules factory.
 * Provides pre-built validation rules for common use cases.
 */
export const CommonValidationRules = {
  /** Required field validation */
  required: (fieldName?: string): ValidationRule => ({
    validate: (value) => TypeValidators.isNonEmptyString(value, { trim: true }),
    message: `${fieldName || 'Field'} is required`,
    code: 'REQUIRED'
  }),

  /** String length validation */
  minLength: (min: number, fieldName?: string): ValidationRule => ({
    validate: (value) => TypeValidators.isString(value) && value.length >= min,
    message: `${fieldName || 'Field'} must be at least ${min} characters`,
    code: 'MIN_LENGTH'
  }),

  maxLength: (max: number, fieldName?: string): ValidationRule => ({
    validate: (value) => TypeValidators.isString(value) && value.length <= max,
    message: `${fieldName || 'Field'} must be ${max} characters or less`,
    code: 'MAX_LENGTH'
  }),

  /** Email validation */
  email: (fieldName?: string): ValidationRule => ({
    validate: (value) => TypeValidators.isEmailString(value),
    message: `${fieldName || 'Field'} must be a valid email address`,
    code: 'INVALID_EMAIL'
  }),

  /** URL validation */
  url: (fieldName?: string): ValidationRule => ({
    validate: (value) => TypeValidators.isUrlString(value),
    message: `${fieldName || 'Field'} must be a valid URL`,
    code: 'INVALID_URL'
  }),

  /** Numeric string validation */
  numeric: (fieldName?: string, options?: { allowNegative?: boolean; allowDecimal?: boolean }): ValidationRule => ({
    validate: (value) => TypeValidators.isNumericString(value, options),
    message: `${fieldName || 'Field'} must be a valid number`,
    code: 'INVALID_NUMBER'
  }),

  /** Pattern validation */
  pattern: (regex: RegExp, message: string, code?: string): ValidationRule => ({
    validate: (value) => TypeValidators.isString(value) && regex.test(value),
    message,
    code: code || 'INVALID_PATTERN'
  }),

  /** Custom function validation */
  custom: (validateFn: (value: any) => boolean, message: string, code?: string): ValidationRule => ({
    validate: validateFn,
    message,
    code: code || 'CUSTOM_VALIDATION'
  })
};

/**
 * Quick field validator for common use cases.
 * Simplified interface for the most frequent validation patterns.
 * 
 * @param fieldType - Type of field to validate
 * @param options - Validation options
 * @returns Field validator function
 * 
 * @example
 * ```typescript
 * const emailValidator = quickFieldValidator('email', { required: true, maxLength: 100 });
 * const nameValidator = quickFieldValidator('text', { required: true, minLength: 2, maxLength: 50 });
 * ```
 */
export const quickFieldValidator = (
  fieldType: 'email' | 'url' | 'text' | 'number' | 'password',
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    fieldName?: string;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}
): (value: any) => FieldValidationResult => {
  const { required = false, minLength, maxLength, fieldName, pattern, patternMessage } = options;
  const rules: ValidationRule[] = [];

  // Required validation
  if (required) {
    rules.push(CommonValidationRules.required(fieldName));
  }

  // Type-specific validation
  switch (fieldType) {
    case 'email':
      rules.push(CommonValidationRules.email(fieldName));
      break;
    case 'url':
      rules.push(CommonValidationRules.url(fieldName));
      break;
    case 'number':
      rules.push(CommonValidationRules.numeric(fieldName));
      break;
    case 'password':
      // Password-specific validation could be added here
      break;
    case 'text':
    default:
      // Basic text validation
      break;
  }

  // Length validation
  if (minLength !== undefined) {
    rules.push(CommonValidationRules.minLength(minLength, fieldName));
  }
  if (maxLength !== undefined) {
    rules.push(CommonValidationRules.maxLength(maxLength, fieldName));
  }

  // Pattern validation
  if (pattern) {
    rules.push(CommonValidationRules.pattern(
      pattern,
      patternMessage || `${fieldName || 'Field'} format is invalid`,
      'INVALID_PATTERN'
    ));
  }

  return createFieldValidator(rules, { fieldName });
};

/**
 * Validates multiple fields at once.
 * 
 * @param fields - Object with field values and validators
 * @param options - Batch validation options
 * @returns Batch validation result
 * 
 * @example
 * ```typescript
 * const result = validateFields({
 *   name: { value: 'John', validator: nameValidator },
 *   email: { value: 'john@example.com', validator: emailValidator },
 *   age: { value: '25', validator: ageValidator }
 * });
 * ```
 */
export const validateFields = <T extends Record<string, any>>(
  fields: {
    [K in keyof T]: {
      value: any;
      validator: (value: any) => FieldValidationResult;
    };
  },
  options: { stopOnFirstError?: boolean } = {}
): {
  isValid: boolean;
  results: { [K in keyof T]: FieldValidationResult };
  allErrors: ValidationError[];
  allWarnings: string[];
} => {
  const { stopOnFirstError = false } = options;
  const results = {} as { [K in keyof T]: FieldValidationResult };
  const allErrors: ValidationError[] = [];
  const allWarnings: string[] = [];
  let isValid = true;

  for (const [fieldName, fieldConfig] of Object.entries(fields)) {
    const result = fieldConfig.validator(fieldConfig.value);
    results[fieldName as keyof T] = result;
    
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
    
    if (!result.isValid) {
      isValid = false;
      if (stopOnFirstError) {
        break;
      }
    }
  }

  return {
    isValid,
    results,
    allErrors,
    allWarnings
  };
};

/**
 * Creates a validation error response in the common format.
 * 
 * @param errors - Array of validation errors
 * @param options - Error response options
 * @returns Standardized error response
 */
export const createValidationErrorResponse = (
  errors: ValidationError[],
  options: { statusCode?: number; includeFieldInfo?: boolean } = {}
): {
  success: false;
  error: {
    type: string;
    message: string;
    fields?: { [fieldName: string]: string[] };
    timestamp: string;
  };
  statusCode?: number;
} => {
  const { statusCode = 400, includeFieldInfo = true } = options;
  
  const fieldErrors: { [fieldName: string]: string[] } = {};
  
  if (includeFieldInfo) {
    errors.forEach(error => {
      if (error.field) {
        if (!fieldErrors[error.field]) {
          fieldErrors[error.field] = [];
        }
        fieldErrors[error.field].push(error.message);
      }
    });
  }
  
  return {
    success: false,
    error: {
      type: 'VALIDATION_ERROR',
      message: 'Validation failed',
      ...(includeFieldInfo && { fields: fieldErrors }),
      timestamp: new Date().toISOString()
    },
    statusCode
  };
};

// Export all validators as a grouped object for convenience
export const FieldValidators = {
  createFieldValidator,
  CommonValidationRules,
  quickFieldValidator,
  validateFields,
  createValidationErrorResponse
};

export default FieldValidators;