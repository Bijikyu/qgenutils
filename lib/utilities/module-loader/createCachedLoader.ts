'use strict';

const loadAndFlattenModule: any = require('./loadAndFlattenModule'); // default flattening function

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
 * const loadQerrors: any = createCachedLoader({ moduleName: 'qerrors' });
 * const qerrors: any = await loadQerrors();
 */
const createCachedLoader = (options: any = {}): any => { // factory for cached async module loaders
  const { moduleName, enableCache = true, flattenFn = loadAndFlattenModule, fallbackValue = null, unavailableMessage } = options;
  const finalUnavailableMessage = unavailableMessage || `Module '${moduleName}' not available, using fallback`;

  if (typeof moduleName !== 'string' || !moduleName.trim()) throw new Error('moduleName is required and must be a non-empty string');

  let cachedModule: any = null, pendingLoad: any = null;

  return async function loadModule() { // loader function
    if (enableCache && cachedModule) return cachedModule;
    if (enableCache && pendingLoad) return pendingLoad;

    pendingLoad = (async (): Promise<any> => { // create new load promise
      try {
        const module: any = await flattenFn(moduleName);
        enableCache && (cachedModule = module);
        return module;
      } catch (error) {
        console.warn(unavailableMessage, error);
        pendingLoad = null;
        return fallbackValue;
      }
    })();

    return pendingLoad;
  };
};

export default createCachedLoader;
