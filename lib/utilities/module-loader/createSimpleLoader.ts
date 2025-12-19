'use strict';

const createCachedLoader: any = require('./createCachedLoader'); // base cached loader

/**
 * Creates a simple non-cached loader function
 * @param {Object} options - Configuration for the loader
 * @param {string} options.moduleName - Module name to dynamically import
 * @param {Function} [options.flattenFn] - Custom flattening function
 * @param {*} [options.fallbackValue=null] - Fallback value when module fails to load
 * @param {string} [options.unavailableMessage] - Log message when module is unavailable
 * @returns {Function} Async function that loads the module without caching
 * @example
 * const loadFresh: any = createSimpleLoader({ moduleName: 'some-module' });
 * const mod: any = await loadFresh(); // always loads fresh
 */
const createSimpleLoader = (options: any = {}): any => { // factory for non-cached loaders
  return createCachedLoader({ ...options, enableCache: false }); // delegate with cache disabled
};

export default createSimpleLoader;
