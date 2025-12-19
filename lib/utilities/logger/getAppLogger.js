/**
 * Get application logger with fallback to console methods.
 *
 * PURPOSE: Provides unified logger access, bridging between qgenutils logger
 * and console methods as fallback. Ensures callers always have a logger
 * supporting info/warn/error/debug regardless of environment.
 *
 * @returns {{info: function, warn: function, error: function, debug: function}}
 */

const getAppLogger = () => {
  try {
    const logger = require('../../logger');
    if (logger && typeof logger.info === 'function') return logger;
  } catch {}

  return {
    info: (...args) => console.info(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
    debug: (...args) => console.debug(...args)
  };
};

module.exports = getAppLogger;
