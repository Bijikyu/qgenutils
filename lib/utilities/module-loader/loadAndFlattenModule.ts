

import { qerrors } from 'qerrors';

/**
 * Dynamic Module Loader with CommonJS/ESM Interop Normalization
 * 
 * PURPOSE: Provides a universal module loading mechanism that handles both
 * CommonJS and ES Modules with consistent interface normalization. This utility
 * is essential for plugin systems, optional dependencies, and dynamic feature loading.
 * 
 * INTEROP STRATEGY:
 * - Default Detection: Identifies if module uses default export pattern
 * - Export Flattening: Merges default exports with named exports
 * - Namespace Preservation: Maintains all exports in a single object
 * - Interface Consistency: Provides uniform access regardless of module format
 * 
 * ERROR HANDLING:
 * - Structured Errors: Creates enhanced error objects with context
 * - Graceful Failure: Returns null instead of throwing for optional modules
 * - Backward Compatibility: Maintains existing code behavior
 * - Comprehensive Logging: Errors are logged with full context for debugging
 * 
 * USE CASES:
 * - Optional dependency loading where modules may not exist
 * - Plugin systems where module availability varies
 * - Development/production-specific module loading
 * - Feature toggling based on configuration or environment
 * - Dynamic import with consistent interface regardless of module format
 * 
 * @param {string} moduleName - Name passed to dynamic import (e.g., 'qerrors')
 * @returns {Promise<Object|null>} Flattened module namespace or null if unavailable
 * @throws {Error} If module name is invalid (not a string or empty)
 * 
 * @example
 * // Basic usage
 * const qerrors = await loadAndFlattenModule('qerrors');
 * if (qerrors) qerrors.someMethod();
 * 
 * @example
 * // Optional module loading
 * const optionalLib = await loadAndFlattenModule('optional-feature');
 * if (optionalLib) {
 *   optionalLib.doSomething();
 * } else {
 *   console.log('Optional feature not available');
 * }
 * 
 * @example
 * // Error handling for invalid module name
 * try {
 *   await loadAndFlattenModule('');
 * } catch (error) {
 *   console.error('Invalid module name:', error.message);
 * }
 */
interface ModuleLoadError extends Error {
  moduleName: string;
  originalError: Error;
}

// Module cache to prevent repeated dynamic imports
const moduleCache = new Map<string, any>();
const MAX_MODULE_CACHE_SIZE = 50;

const loadAndFlattenModule = async (moduleName: string): Promise<any> => { // dynamically load module with CJS/ESM normalization and robust error handling
  // Validate module name to prevent runtime errors and provide clear error messages
  if (typeof moduleName !== 'string' || !moduleName.trim()) {
    const error = new Error(`Invalid module name: ${moduleName}`);
    (error as ModuleLoadError).moduleName = moduleName;
    throw error;
  }

  // Check cache first to avoid repeated dynamic imports
  if (moduleCache.has(moduleName)) {
    return moduleCache.get(moduleName);
  }

  try {
    // Attempt dynamic import of the specified module
    const namespace = await import(moduleName);

    // Validate that the module namespace exists and is not null/undefined
    if (!namespace) {
      const error = new Error(`Module ${moduleName} returned null/undefined namespace`);
      (error as ModuleLoadError).moduleName = moduleName;
      throw error;
    }

    // Extract default export if it exists (CommonJS compatibility)
    const def = namespace.default;

    // If default export exists and is an object, merge with named exports
    // This creates a flattened namespace where both default and named exports are available
    const result = def && typeof def === 'object' ? { ...def, ...namespace } : namespace;

    // Cache the result to prevent repeated imports
    if (moduleCache.size >= MAX_MODULE_CACHE_SIZE) {
      const firstKey = moduleCache.keys().next().value;
      moduleCache.delete(firstKey);
    }
    moduleCache.set(moduleName, result);

    return result;
  } catch (error) {
    // Create a structured error with full context for debugging and monitoring
    const moduleError = new Error(`Failed to load module ${moduleName}: ${error instanceof Error ? error.message : String(error)}`) as ModuleLoadError;
    moduleError.moduleName = moduleName;
    moduleError.originalError = error instanceof Error ? error : new Error(String(error));
    
    // Use qerrors for consistent error reporting across the application
    qerrors(moduleError, 'loadAndFlattenModule', `Module loading failed for: ${moduleName}`);
    
    // Return null for backward compatibility and graceful fallback handling
    // The error is logged with full context, but calling code can handle the null result
    return null;
  }
};

export default loadAndFlattenModule;
