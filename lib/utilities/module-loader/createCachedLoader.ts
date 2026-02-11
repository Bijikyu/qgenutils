/**
 * Cached Module Loader Factory - Performance-Optimized Dynamic Loading
 *
 * PURPOSE: Creates a high-performance module loader with intelligent caching,
 * concurrency handling, and graceful fallback mechanisms. This utility eliminates
 * redundant module loading while providing robust error recovery for production systems.
 *
 * CACHING STRATEGY:
 * - In-Memory Cache: Holds successfully loaded modules for immediate access
 * - Promise Deduplication: Prevents concurrent loads of the same module
 * - Lazy Evaluation: Modules are loaded only when first requested
 * - Error Isolation: Failed loads don't prevent future retry attempts
 *
 * PERFORMANCE BENEFITS:
 * - Reduced I/O: Eliminates redundant filesystem operations
 * - Faster Startup: Cached modules are available immediately
 * - Memory Efficient: Single instance shared across all consumers
 * - Concurrency Safe: Handles multiple simultaneous requests gracefully
 *
 * PRODUCTION USE CASES:
 * - Optional dependency loading with fallback behavior
 * - Plugin systems where modules may not be available
 * - Configuration-driven feature toggling
 * - Development/production environment-specific module loading
 *
 * @param {Object} options - Configuration for the loader with intelligent defaults
 * @param {string} options.moduleName - Module name to dynamically import
 * @param {boolean} [options.enableCache=true] - Whether to enable in-memory caching
 * @param {Function} [options.flattenFn] - Custom flattening function (defaults to loadAndFlattenModule)
 * @param {*} [options.fallbackValue=null] - Fallback value when module fails to load
 * @param {string} [options.unavailableMessage] - Custom log message when module is unavailable
 * @returns {Function} Async function that loads and caches the module with error handling
 *
 * @example
 * // Basic cached loader
 * const loadQerrors = createCachedLoader({ moduleName: 'qerrors' });
 * const qerrors = await loadQerrors();
 *
 * @example
 * // Loader with fallback for optional dependency
 * const loadOptionalFeature = createCachedLoader({
 *   moduleName: 'expensive-feature',
 *   fallbackValue: { disabled: true },
 *   unavailableMessage: 'Optional feature module not available'
 * });
 *
 * @example
 * // Disabled caching for development
 * const loadDevModule = createCachedLoader({
 *   moduleName: 'dev-tools',
 *   enableCache: false // always reload in development
 * });
 */
'use strict';

import { qerr as qerrors } from '@bijikyu/qerrors';

import loadAndFlattenModule from './loadAndFlattenModule.js'; // default flattening function

const createCachedLoader = (options: any = {}): any => { // factory for cached async module loaders with performance optimization
  const { moduleName, enableCache = true, flattenFn = loadAndFlattenModule, fallbackValue = null, unavailableMessage } = options;
  const finalUnavailableMessage = unavailableMessage || `Module '${moduleName}' not available, using fallback`;

  // Validate required parameters to prevent runtime errors
  if (typeof moduleName !== 'string' || !moduleName.trim()) {
    throw new Error('moduleName is required and must be a non-empty string');
  }

  // Cache state management for performance optimization
  let cachedModule: any = null, pendingLoad: any = null;

  return async function loadModule() { // loader function with caching and concurrency control
    // Return cached module immediately if available and caching is enabled
    if (enableCache && cachedModule) {
      return cachedModule;
    }

    // Return pending promise if load is already in progress (concurrency control)
    if (enableCache && pendingLoad) {
      return pendingLoad;
    }

    pendingLoad = (async (): Promise<any> => { // create new load promise with comprehensive error handling
      try {
        // Load and flatten the module using the provided flattening function
        const module: any = await flattenFn(moduleName);

        // Cache successfully loaded module for future immediate access
        enableCache && (cachedModule = module);
        return module;
      } catch (error) {
        // Log error for monitoring and debugging purposes
        qerrors(error instanceof Error ? error : new Error(String(error)), 'createCachedLoader', `Cached module loading failed for: ${moduleName}`);

        // Warn about module unavailability with custom or default message
        console.warn(finalUnavailableMessage, error);

        // Return fallback value to maintain application functionality
        // Don't clear pendingLoad here - let it resolve so all concurrent calls get the same result
        // The cache will remain null, allowing future calls to retry the loading process
        return fallbackValue;
      } finally {
        // Clear pendingLoad after the promise resolves/rejects to allow future retries
        // This ensures that subsequent load attempts will create new promises
        pendingLoad = null;
      }
    })();

    return pendingLoad;
  };
};

export default createCachedLoader;
