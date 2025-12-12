'use strict';

const loadAndFlattenModule = require('./loadAndFlattenModule'); // default flattening function

/**
 * Creates a cached loader function for a given module
 * Eliminates duplication and handles caching, flattening, and error recovery
 * @param {Object} options - Configuration for the loader
 * @param {string} options.moduleName - Module name to dynamically import
 * @param {boolean} [options.enableCache=true] - Whether to enable caching
 * @param {Function} [options.flattenFn] - Custom flattening function (defaults to loadAndFlattenModule)
 * @param {*} [options.fallbackValue=null] - Fallback value when module fails to load
 * @param {string} [options.unavailableMessage] - Log message when module is unavailable
 * @returns {Function} Async function that loads and caches the module
 * @example
 * const loadQerrors = createCachedLoader({ moduleName: 'qerrors' });
 * const qerrors = await loadQerrors();
 */
function createCachedLoader(options = {}) { // factory for cached async module loaders
  const moduleName = options.moduleName; // required module name
  const enableCache = options.enableCache !== false; // default to true
  const flattenFn = options.flattenFn || loadAndFlattenModule; // default flattening
  const fallbackValue = options.fallbackValue !== undefined ? options.fallbackValue : null; // default fallback
  const unavailableMessage = options.unavailableMessage || `Module '${moduleName}' not available, using fallback`; // default message

  if (typeof moduleName !== 'string' || !moduleName.trim()) { // validate module name
    throw new Error('moduleName is required and must be a non-empty string');
  }

  let cachedModule = null; // cached module instance
  let pendingLoad = null; // pending promise to avoid concurrent loads

  return async function loadModule() { // loader function
    if (enableCache && cachedModule) { // return cached instance if available
      return cachedModule;
    }

    if (enableCache && pendingLoad) { // return existing pending promise
      return pendingLoad;
    }

    pendingLoad = (async () => { // create new load promise
      try {
        const module = await flattenFn(moduleName); // load and flatten

        if (enableCache) { // cache if enabled
          cachedModule = module;
        }

        return module;
      } catch (error) {
        console.warn(unavailableMessage, error); // log warning
        pendingLoad = null; // clear pending on error
        return fallbackValue;
      }
    })();

    return pendingLoad;
  };
}

module.exports = createCachedLoader;
