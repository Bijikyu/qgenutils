/**
 * Helper Utilities Module - Centralized Export Hub
 * 
 * Purpose: Provides centralized access to core helper utilities for type validation,
 * input processing, and secure JSON operations. This barrel export serves as the
 * main entry point for helper utilities while optimizing for tree-shaking and
 * bundle size efficiency.
 * 
 * Module Organization Strategy:
 * - Type Validation: String and date validation utilities
 * - Input Validation: Required field validation and sanitization
 * - JSON Processing: Secure parsing and stringification with security controls
 * - Core Utilities: Essential helper functions for common operations
 * 
 * Export Philosophy:
 * - Named exports: Enable tree-shaking and explicit dependency tracking
 * - No default export: Prevents bundle bloat and interface visibility issues
 * - Logical grouping: Related utilities organized by functionality
 * - Type safety: Full TypeScript support with proper interfaces
 * 
 * Tree-Shaking Optimization:
 * - Named imports allow bundlers to eliminate unused utilities
 * - No default export prevents forced inclusion of all utilities
 * - Explicit exports enable static analysis and dead code elimination
 * - Modular structure supports code splitting and lazy loading
 * 
 * Usage Patterns:
 * - Import specific utilities: `import { isValidString } from './helpers'`
 * - Multiple utilities: `import { isValidString, safeJsonParse } from './helpers'`
 * - Type preservation: Full TypeScript interface support
 * - Bundle optimization: Only imported utilities included in final bundle
 * 
 * Security Considerations:
 * - All JSON utilities include prototype pollution protection
 * - Input validation utilities prevent injection attacks
 * - Type checking utilities ensure runtime type safety
 * - Error handling follows security best practices
 * 
 * Performance Impact:
 * - Minimal overhead for utility operations
 * - Optimized for high-frequency validation scenarios
 * - Efficient algorithms for type checking and validation
 * - Memory-conscious implementation patterns
 * 
 * @author Helper Utilities Team
 * @since 1.0.0
 */

// ============================================================================
// TYPE VALIDATION UTILITIES
// ============================================================================

// Core string validation with security and type safety
import isValidString from './isValidString.js';

// Core date validation with timezone and validity checking
import isValidDate from './isValidDate.js';

// ============================================================================
// INPUT VALIDATION UTILITIES
// ============================================================================

// Required field validation with comprehensive error handling
import validateRequired from './validateRequired.js';

// ============================================================================
// SECURE JSON PROCESSING UTILITIES
// ============================================================================

// Secure JSON parsing with prototype pollution protection
import safeJsonParse from './safeJsonParse.js';

// Secure JSON stringification with circular reference handling
import safeJsonStringify from './safeJsonStringify.js';

// ============================================================================
// CORE UTILITY FUNCTIONS
// ============================================================================

// Conditional requirement with validation and error handling
import requireAndValidate from './requireAndValidate.js';

// ============================================================================
// CENTRALIZED ERROR HANDLING UTILITIES
// ============================================================================

import { 
  handleUtilityError,
  handleAsyncUtilityError,
  handleValidationError 
} from './handleUtilityError.js';

// ============================================================================
// INPUT VALIDATION UTILITIES
// ============================================================================

import { 
  validateInput,
  validateString,
  validateNumber,
  validateArray,
  type ValidationResult 
} from './validateInput.js';

// ============================================================================
// DEBUG LOGGING UTILITIES
// ============================================================================

import { 
  createDebugLogger,
  createPerformanceMonitor,
  createSimpleDebugLogger,
  type DebugLogger 
} from './debugLogger.js';

// ============================================================================
// JSDOC TEMPLATE UTILITIES
// ============================================================================

import { 
  generateJSDoc,
  createJSDocParam,
  createJSDocReturn,
  validationFunctionTemplate,
  transformationFunctionTemplate,
  formatFunctionTemplate,
  generatorFunctionTemplate,
  configFunctionTemplate
} from './jsdocTemplates.js';

// ============================================================================
// NAMED EXPORTS - Tree-Shaking Optimized
// ============================================================================

/**
 * Named exports for optimal tree-shaking and bundle efficiency.
 * 
 * Import Strategy:
 * - Use named imports: `import { utility } from './helpers'`
 * - Avoid default imports: Prevents bundle bloat
 * - Explicit dependencies: Enables static analysis and optimization
 * - Type preservation: Full TypeScript interface support
 * 
 * Bundle Optimization:
 * - Only imported utilities included in final bundle
 * - Dead code elimination for unused exports
 * - Static analysis enables tree-shaking
 * - Minimal runtime overhead
 */
export {
  // Type Validation Utilities
  isValidString,
  isValidDate,
  
  // Input Validation Utilities
  validateRequired,
  
  // Secure JSON Processing Utilities
  safeJsonParse,
  safeJsonStringify,
  
  // Core Utility Functions
  requireAndValidate,
  
  // Centralized Error Handling Utilities
  handleUtilityError,
  handleAsyncUtilityError,
  handleValidationError,
  
  // Enhanced Input Validation Utilities
  validateInput,
  validateString,
  validateNumber,
  validateArray,
  
  // Validation Types
  type ValidationResult,
  
  // Debug Logging Utilities
  createDebugLogger,
  createPerformanceMonitor,
  createSimpleDebugLogger,
  
  // Debug Logger Types
  type DebugLogger,
  
  // JSDoc Template Utilities
  generateJSDoc,
  createJSDocParam,
  createJSDocReturn,
  validationFunctionTemplate,
  transformationFunctionTemplate,
  formatFunctionTemplate,
  generatorFunctionTemplate,
  configFunctionTemplate
};

// ============================================================================
// EXPORT DESIGN NOTES
// ============================================================================

/**
 * Why No Default Export?
 * 
 * 1. Tree-Shaking: Default exports prevent effective tree-shaking
 * 2. Bundle Size: Named exports enable dead code elimination
 * 3. Type Safety: Better TypeScript interface visibility
 * 4. Explicit Dependencies: Clearer import intentions
 * 5. Static Analysis: Easier for bundlers to optimize
 * 
 * Recommended Usage:
 * ```typescript
 * // ✅ Good: Named imports with tree-shaking
 * import { isValidString, safeJsonParse } from './helpers';
 * 
 * // ❌ Avoid: Default import prevents optimization
 * import helpers from './helpers';
 * ```
 */
