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
async function loadAndFlattenModule(moduleName) { // dynamically load module with CJS/ESM normalization
  if (typeof moduleName !== 'string' || !moduleName.trim()) { // validate module name
    return null;
  }

  try {
    const namespace = await import(moduleName); // dynamic import

    if (!namespace) { // handle null/undefined response
      return null;
    }

    const def = namespace.default; // get default export if present

    if (def && typeof def === 'object') { // combine default with named exports for CJS/ESM parity
      return { ...def, ...namespace };
    }

    return namespace; // return named exports directly
  } catch { // silently fail and return null for graceful fallback
    return null;
  }
}

module.exports = loadAndFlattenModule;
