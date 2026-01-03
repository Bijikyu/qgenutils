/**
 * String Transformation Utilities - Lodash-based Implementation
 * 
 * PURPOSE: Provides type-safe string transformation utilities using battle-tested
 * lodash implementations while maintaining the existing API for backward compatibility.
 * 
 * MIGRATION NOTE: This replaces 411 lines of custom string transformation
 * code with optimized lodash equivalents, reducing maintenance burden and improving
 * performance through lodash's battle-tested implementations.
 * 
 * SECURITY: Maintains same type checking and error handling patterns as
 * original implementation while leveraging lodash's robust string operations.
 */

import { qerrors } from 'qerrors';
const _ = require('lodash');

/**
 * Type-safe wrapper for lodash string functions
 */
function safeStringOperation(operation: string, value: any, defaultValue: string = '', ...args: any[]): string {
  try {
    if (typeof value !== 'string') {
      return defaultValue;
    }
    
    // Call the appropriate lodash function dynamically
    const fn = (_ as any)[operation];
    if (typeof fn !== 'function') {
      return defaultValue;
    }
    
    return fn(value, ...args);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), operation, `String operation failed for value: ${value}`);
    return defaultValue;
  }
}

/**
 * Safely trims whitespace from both ends of a string
 */
function safeTrim(value: any, defaultValue: string = ''): string {
  return safeStringOperation('trim', value, defaultValue);
}

/**
 * Safely converts string to lowercase
 */
function safeToLower(value: any, defaultValue: string = ''): string {
  return safeStringOperation('toLower', value, defaultValue);
}

/**
 * Safely converts string to uppercase
 */
function safeToUpper(value: any, defaultValue: string = ''): string {
  return safeStringOperation('toUpper', value, defaultValue);
}

/**
 * Safely capitalizes first letter of string
 */
function safeCapitalize(value: any, defaultValue: string = ''): string {
  return safeStringOperation('capitalize', value, defaultValue);
}

/**
 * Safely converts string to camelCase
 */
function safeToCamelCase(value: any, defaultValue: string = ''): string {
  return safeStringOperation('camelCase', value, defaultValue);
}

/**
 * Safely converts string to snake_case
 */
function safeToSnakeCase(value: any, defaultValue: string = ''): string {
  return safeStringOperation('snakeCase', value, defaultValue);
}

/**
 * Safely converts string to kebab-case
 */
function safeToKebabCase(value: any, defaultValue: string = ''): string {
  return safeStringOperation('kebabCase', value, defaultValue);
}

/**
 * Safely truncates string to specified length
 */
function safeTruncate(value: any, length: number, defaultValue: string = ''): string {
  try {
    if (typeof value !== 'string') {
      return defaultValue;
    }
    return _.truncate(value, { length });
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safeTruncate', `String truncation failed for value: ${value}, length: ${length}`);
    return defaultValue;
  }
}

/**
 * Safely pads string to specified length
 */
function safePad(value: any, length: number, defaultValue: string = ''): string {
  try {
    if (typeof value !== 'string') {
      return defaultValue;
    }
    return _.padEnd(value, length);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safePad', `String padding failed for value: ${value}, length: ${length}`);
    return defaultValue;
  }
}

/**
 * Safely removes non-alphanumeric characters
 */
function safeRemoveNonAlphaNumeric(value: any, defaultValue: string = ''): string {
  try {
    if (typeof value !== 'string') {
      return defaultValue;
    }
    // Use lodash.deburr for accent removal, then filter alphanumeric
    const deburred = _.deburr(value);
    return deburred.replace(/[^a-zA-Z0-9]/g, '');
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safeRemoveNonAlphaNumeric', `String cleaning failed for value: ${value}`);
    return defaultValue;
  }
}

/**
 * Composes multiple string transformations
 */
function safeTransform(value: any, steps: Array<(value: string) => string>, defaultValue: string = ''): string {
  try {
    if (typeof value !== 'string') {
      return defaultValue;
    }
    return steps.reduce((result, step) => step(result), value);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safeTransform', `String transformation failed for value: ${value}`);
    return defaultValue;
  }
}

/**
 * Combined trim + lowercase
 */
function safeTrimToLower(value: any, defaultValue: string = ''): string {
  return safeToLower(safeTrim(value, defaultValue), defaultValue);
}

/**
 * Combined trim + uppercase
 */
function safeTrimToUpper(value: any, defaultValue: string = ''): string {
  return safeToUpper(safeTrim(value, defaultValue), defaultValue);
}

/**
 * Normalizes whitespace (multiple spaces to single space)
 */
function safeNormalizeWhitespace(value: any, defaultValue: string = ''): string {
  try {
    if (typeof value !== 'string') {
      return defaultValue;
    }
    return value.replace(/\s+/g, ' ').trim();
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safeNormalizeWhitespace', `Whitespace normalization failed for value: ${value}`);
    return defaultValue;
  }
}

/**
 * Creates a transformation pipeline
 */
function createStringPipeline(steps: Array<{ fn: (value: any) => any }> = []) {
  return function(value: any, defaultValue: string = ''): string {
    return safeTransform(value, steps.map(step => step.fn), defaultValue);
  };
}

/**
 * Common transformation presets (maintaining API compatibility)
 */
const TRANSFORM_PRESETS = {
  trim: (value: any) => safeTrim(value),
  lower: (value: any) => safeToLower(value),
  upper: (value: any) => safeToUpper(value),
  capitalize: (value: any) => safeCapitalize(value),
  trimLower: (value: any) => safeTrimToLower(value),
  trimUpper: (value: any) => safeTrimToUpper(value),
  normalize: (value: any) => safeNormalizeWhitespace(value),
  camelCase: (value: any) => safeToCamelCase(value),
  snakeCase: (value: any) => safeToSnakeCase(value),
  kebabCase: (value: any) => safeToKebabCase(value)
};

export default {
  safeTrim,
  safeToLower,
  safeToUpper,
  safeCapitalize,
  safeTrimToLower,
  safeTrimToUpper,
  safeNormalizeWhitespace,
  safeToCamelCase,
  safeToSnakeCase,
  safeToKebabCase,
  safeTruncate,
  safePad,
  safeRemoveNonAlphaNumeric,
  safeTransform,
  createStringPipeline,
  TRANSFORM_PRESETS
};