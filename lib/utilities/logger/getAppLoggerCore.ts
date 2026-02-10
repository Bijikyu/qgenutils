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
    const qgenutils: any = await import('@bijikyu/qgenutils');
    const logger: any = qgenutils?.logger;
    if (logger && typeof logger.info === 'function') {
      return logger;
    }
  } catch {
  }

  try {
    if (loggerImport && typeof loggerImport.info === 'function') {
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
