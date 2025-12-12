/**
 * Core implementation for qerrors-wrapped async operations.
 *
 * PURPOSE: Centralizes try/catch, logging, and error construction patterns
 * for async operations with qerrors integration. Supports hooks for
 * context augmentation and message formatting.
 *
 * @param {object} options - Execution options
 * @param {string} options.opName - Operation name for logging
 * @param {function} options.operation - Async operation to execute
 * @param {object} [options.context] - Additional context for logging
 * @param {string} options.failureMessage - Message for failure errors
 * @param {string} [options.errorCode] - Error code for typed errors
 * @param {string} [options.errorType] - Error type (defaults to SYSTEM)
 * @param {string} [options.logMessage] - Custom log message
 * @param {boolean} [options.rethrow=true] - Whether to rethrow on failure
 * @param {*} [options.fallbackValue] - Value to return on failure if not rethrowing
 * @param {object} [hooks] - Customization hooks
 * @param {function} [hooks.augmentContext] - Augments context with error details
 * @param {function} [hooks.formatFailureMessage] - Formats the failure message
 * @returns {Promise<*>} Result of operation or fallback value
 */

const { loadQerrors, formatErrorMessage, logErrorMaybe } = require('./qerrorsCommon');

async function attempt(fn) {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error };
  }
}

async function executeWithQerrorsCore(options, hooks = {}) {
  const {
    opName,
    operation,
    context = {},
    failureMessage,
    errorCode,
    errorType,
    logMessage = `${opName} failed`,
    rethrow = true,
    fallbackValue
  } = options;

  const fallbackToken = Symbol('qerrorsFallback');
  const qerrors = await loadQerrors();
  let capturedError = null;

  const guardedOperation = async () => {
    try {
      return await operation();
    } catch (error) {
      capturedError = error;
      throw error;
    }
  };

  if (qerrors && typeof qerrors.withErrorHandling === 'function') {
    const result = await qerrors.withErrorHandling(
      guardedOperation,
      opName,
      context,
      { fallback: fallbackToken }
    );
    if (result !== fallbackToken) {
      return result;
    }
  } else {
    const outcome = await attempt(guardedOperation);
    if (outcome.ok) {
      return outcome.value;
    }
  }

  if (!capturedError) {
    capturedError = new Error('Unknown error');
  }

  const renderedError = formatErrorMessage(capturedError);
  const baseContext = {
    ...context,
    errorMessage: renderedError,
    errorCode
  };

  const enrichedContext = hooks.augmentContext
    ? hooks.augmentContext(capturedError, baseContext)
    : baseContext;

  await logErrorMaybe(qerrors, opName, logMessage, enrichedContext);

  if (rethrow) {
    const resolvedType =
      errorType ??
      qerrors?.ErrorTypes?.DEPENDENCY ??
      qerrors?.ErrorTypes?.SYSTEM ??
      'SYSTEM';

    const baseFailure = `${failureMessage}: ${renderedError}`;
    const finalFailure = hooks.formatFailureMessage
      ? hooks.formatFailureMessage(baseFailure, capturedError, enrichedContext)
      : baseFailure;

    if (qerrors && typeof qerrors.createTypedError === 'function') {
      throw qerrors.createTypedError(finalFailure, resolvedType, errorCode);
    }
    throw new Error(finalFailure);
  }

  return fallbackValue;
}

module.exports = executeWithQerrorsCore;
