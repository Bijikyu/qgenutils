'use strict';

const createCachedLoader = require('./createCachedLoader'); // base cached loader

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
 * const loadDirect = createDirectLoader({ moduleName: 'some-module' });
 * const mod = await loadDirect();
 */
const createDirectLoader = (options = {}) => { // factory for direct loaders without flattening
  const directFlatten = async (moduleName) => { // simple flatten that prefers default
    const mod = await import(moduleName);
    return mod?.default ?? mod;
  };

  return createCachedLoader({ ...options, flattenFn: directFlatten }); // delegate with custom flatten
};

module.exports = createDirectLoader;
