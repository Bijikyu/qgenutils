/**
 * Get application logger with fallback to console methods.
 *
 * PURPOSE: Provides unified logger access, bridging between qgenutils logger
 * and console methods as fallback. Ensures callers always have a logger
 * supporting info/warn/error/debug regardless of environment.
 *
 * @returns {{info: function, warn: function, error: function, debug: function}}
 */

const getAppLogger = (): any => {
  try {
    // Try to import logger - using dynamic import for ES modules
    const logger = require('../../logger.js');
    if (logger && typeof logger.info === 'function') return logger;
  } catch {}

  return {
    info: (...args: any[]) => console.info(...args),
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args),
    debug: (...args: any[]) => console.debug(...args)
  };
};

export default getAppLogger;
