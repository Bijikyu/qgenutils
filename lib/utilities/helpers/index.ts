/**
 * Helper Utilities Module Export
 * 
 * PURPOSE: Provides centralized access to core helper utilities
 * for type validation and JSON processing with security focus.
 * This barrel export makes it easier to import essential helper
 * utilities while maintaining tree-shaking support.
 */

// Core type validation utilities
import isValidString from './isValidString';
import isValidDate from './isValidDate';

// Core input validation utilities
import validateRequired from './validateRequired';

// Core JSON processing utilities
import safeJsonParse from './safeJsonParse';
import safeJsonStringify from './safeJsonStringify';

// Core utility function
import requireAndValidate from './requireAndValidate';

// Named exports for better tree-shaking support
export {
  isValidString,
  isValidDate,
  validateRequired,
  safeJsonParse,
  safeJsonStringify,
  requireAndValidate
};

// Note: Default export omitted due to interface visibility issues
// Use named imports for better tree-shaking and type safety