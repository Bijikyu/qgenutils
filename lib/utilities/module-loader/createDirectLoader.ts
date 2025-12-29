'use strict';

import createCachedLoader from './createCachedLoader.js'; // base cached loader

/**
 * Creates a loader that uses dynamic import directly without flattening
 * Useful for modules that don't need CJS/ESM interop handling
 * @param {Object} options - Configuration for the loader
 * @param {string} options.moduleName - Module name to dynamically import
 * @param {boolean} [options.enableCache=true] - Whether to enable caching
 * @param {*} [options.fallbackValue=null] - Fallback value when module fails to load
 * @param {string} [options.unavailableMessage] - Log message when module is unavailable
 * @returns {Function} Async function that loads and caches the module
 * @example
 * const loadDirect: any = createDirectLoader({ moduleName: 'some-module' });
 * const mod: any = await loadDirect();
 */
const createDirectLoader = (options: any = {}): any => { // factory for direct loaders without flattening
  const directFlatten = async (moduleName: any): Promise<any> => { // simple flatten that prefers default
    const mod: any = await import(moduleName);
    return mod?.default ?? mod;
  };

  return createCachedLoader({ ...options, flattenFn: directFlatten }); // delegate with custom flatten
};

export default createDirectLoader;
