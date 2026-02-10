/**
 * Core logger resolver shared by lib and utils.
 *
 * PURPOSE: Centralizes logger resolution logic, preferring qgenutils.logger
 * and falling back to bound console methods when unavailable.
 *
 * @returns {{info: function, warn: function, error: function, debug: function}}
 */

import loggerImport from '../../logger.js';

const getAppLoggerCore = async (): Promise<any> => {
  try {
    if (loggerImport && typeof loggerImport.info === 'function') { // prefer the package's own logger via relative import
      return loggerImport;
    }
  } catch {
  }

  return {
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console)
  };
};

export default getAppLoggerCore;
