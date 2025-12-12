/**
 * Core logger resolver shared by lib and utils.
 *
 * PURPOSE: Centralizes logger resolution logic, preferring qgenutils.logger
 * and falling back to bound console methods when unavailable.
 *
 * @returns {{info: function, warn: function, error: function, debug: function}}
 */

function getAppLoggerCore() {
  try {
    const qgenutils = require('qgenutils');
    const logger = qgenutils?.logger;
    if (logger && typeof logger.info === 'function') {
      return logger;
    }
  } catch {
  }

  try {
    const logger = require('../../logger');
    if (logger && typeof logger.info === 'function') {
      return logger;
    }
  } catch {
  }

  return {
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console)
  };
}

module.exports = getAppLoggerCore;
