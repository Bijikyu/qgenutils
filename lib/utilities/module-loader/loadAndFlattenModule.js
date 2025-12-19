'use strict';

/**
 * Generic dynamic module loader that normalizes CommonJS/ESM interop
 * Flattens default exports with named exports for consistent interface
 * @param {string} moduleName - Name passed to dynamic import (e.g., 'qerrors')
 * @returns {Promise<Object|null>} Flattened module namespace or null if unavailable
 * @example
 * const qerrors = await loadAndFlattenModule('qerrors');
 * if (qerrors) qerrors.someMethod();
 */
const loadAndFlattenModule = async (moduleName) => { // dynamically load module with CJS/ESM normalization
  if (typeof moduleName !== 'string' || !moduleName.trim()) return null;

  try {
    const namespace = await import(moduleName);

    if (!namespace) return null;

    const def = namespace.default;

    if (def && typeof def === 'object') return { ...def, ...namespace };

    return namespace;
  } catch {
    return null;
  }
};

module.exports = loadAndFlattenModule;
