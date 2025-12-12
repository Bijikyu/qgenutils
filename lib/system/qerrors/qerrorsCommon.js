/**
 * Shared qerrors integration helpers with fallback support.
 *
 * PURPOSE: Centralizes qerrors loading logic and provides standardized
 * error formatting and logging functions with robust fallbacks.
 */

let qerrorsModuleCached = null;
let qerrorsModulePromise = null;

try {
  qerrorsModuleCached = require('qerrors');
} catch {
  qerrorsModuleCached = null;
}

async function loadQerrors() {
  if (qerrorsModuleCached) {
    return qerrorsModuleCached;
  }
  
  if (!qerrorsModulePromise) {
    qerrorsModulePromise = import('qerrors').catch(() => null);
  }
  
  return qerrorsModulePromise;
}

function formatErrorMessage(error) {
  if (error instanceof Error && typeof error.message === 'string') {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

async function logErrorMaybe(qerrors, opName, logMessage, context) {
  if (qerrors?.logError) {
    return await qerrors.logError(logMessage, context);
  }
  
  try {
    const qgenutils = require('qgenutils');
    if (qgenutils?.logger?.error) {
      return qgenutils.logger.error(`[${opName}] ${context.errorMessage ?? 'error'}`, context);
    }
  } catch {
  }
  
  console.error(`[${opName}]`, context);
}

function getQerrorsCached() {
  return qerrorsModuleCached;
}

module.exports = {
  loadQerrors,
  formatErrorMessage,
  logErrorMaybe,
  getQerrorsCached
};
