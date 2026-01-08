/**
 * String Processing Utilities Module Export
 * 
 * PURPOSE: Provides centralized access to core string utilities
 * with security-focused sanitization and transformation capabilities.
 * This barrel export makes it easier to import multiple string
 * utilities while maintaining tree-shaking support.
 */

// Core string utilities
import sanitizeString from './sanitizeString.js';

// Named exports for better tree-shaking support
export {
  sanitizeString
};

// Default export for convenience
export default {
  sanitizeString
};
