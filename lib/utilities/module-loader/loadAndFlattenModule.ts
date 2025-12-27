

import { qerrors } from 'qerrors';

/**
 * Generic dynamic module loader that normalizes CommonJS/ESM interop
 * Flattens default exports with named exports for consistent interface
 * @param {string} moduleName - Name passed to dynamic import (e.g., 'qerrors')
 * @returns {Promise<Object|null>} Flattened module namespace or null if unavailable
 * @example
 * const qerrors: any = await loadAndFlattenModule('qerrors');
 * if (qerrors) qerrors.someMethod();
 */
interface ModuleLoadError extends Error {
  moduleName: string;
  originalError: Error;
}

const loadAndFlattenModule = async (moduleName: string): Promise<any> => { // dynamically load module with CJS/ESM normalization
  if (typeof moduleName !== 'string' || !moduleName.trim()) {
    const error = new Error(`Invalid module name: ${moduleName}`);
    (error as ModuleLoadError).moduleName = moduleName;
    throw error;
  }

  try {
    const namespace = await import(moduleName);

    if (!namespace) {
      const error = new Error(`Module ${moduleName} returned null/undefined namespace`);
      (error as ModuleLoadError).moduleName = moduleName;
      throw error;
    }

    const def = namespace.default;

    if (def && typeof def === 'object') return { ...def, ...namespace };

    return namespace;
  } catch (error) {
    // Create a structured error with context
    const moduleError = new Error(`Failed to load module ${moduleName}: ${error instanceof Error ? error.message : String(error)}`) as ModuleLoadError;
    moduleError.moduleName = moduleName;
    moduleError.originalError = error instanceof Error ? error : new Error(String(error));
    
    // Use qerrors for consistent error reporting
    qerrors(moduleError, 'loadAndFlattenModule', `Module loading failed for: ${moduleName}`);
    
    // Return null for backward compatibility, but the error is logged with full context
    return null;
  }
};

export default loadAndFlattenModule;
