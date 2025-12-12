'use strict';

const createCachedLoader = require('./createCachedLoader'); // base cached loader

/**
 * Creates a simple non-cached loader function
 * @param {Object} options - Configuration for the loader
 * @param {string} options.moduleName - Module name to dynamically import
 * @param {Function} [options.flattenFn] - Custom flattening function
 * @param {*} [options.fallbackValue=null] - Fallback value when module fails to load
 * @param {string} [options.unavailableMessage] - Log message when module is unavailable
 * @returns {Function} Async function that loads the module without caching
 * @example
 * const loadFresh = createSimpleLoader({ moduleName: 'some-module' });
 * const mod = await loadFresh(); // always loads fresh
 */
function createSimpleLoader(options = {}) { // factory for non-cached loaders
  return createCachedLoader({ ...options, enableCache: false }); // delegate with cache disabled
}

module.exports = createSimpleLoader;
