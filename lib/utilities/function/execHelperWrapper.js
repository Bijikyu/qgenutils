/**
 * Exec Helper Wrapper
 * 
 * Higher-order function that wraps functions with standardized
 * error handling, logging, timeout, and retry capabilities.
 * 
 * @param {Function} fn - Function to wrap
 * @param {object} [options] - Wrapper options
 * @param {string} [options.context='Unknown'] - Execution context name
 * @param {boolean} [options.logExecution=false] - Log execution start/end
 * @param {boolean} [options.logErrors=true] - Log errors
 * @param {boolean} [options.logPerformance=false] - Log execution time
 * @param {Function} [options.errorTransform] - Transform errors before throwing
 * @param {number} [options.timeoutMs] - Execution timeout in ms
 * @param {number} [options.retryCount=0] - Number of retries on failure
 * @param {number} [options.retryDelay=1000] - Delay between retries in ms
 * @param {Function} [options.validateInput] - Input validation function
 * @param {Function} [options.validateOutput] - Output validation function
 * @param {Function} [options.logger] - Custom logger (defaults to console)
 * @returns {Function} Wrapped async function
 */
const execHelperWrapper = (fn, options = {}) => {
  if (typeof fn !== 'function') throw new Error('Function to wrap must be a valid function');

  const {
    context = 'Unknown',
    logExecution = false,
    logErrors = true,
    logPerformance = false,
    errorTransform = null,
    timeoutMs = null,
    retryCount = 0,
    retryDelay = 1000,
    validateInput = null,
    validateOutput = null,
    logger = console
  } = options;

  if (retryCount > 0 && retryDelay <= 0) throw new Error('retryDelay must be positive when retryCount > 0');

  const functionName = fn.name || 'anonymous', wrapperContext = `${context}:${functionName}`;

  return async function wrappedFunction(...args) {
    const startTime = logPerformance ? Date.now() : null;

    try {
      logExecution && logger.log(`[ExecHelper] Starting ${wrapperContext}`);

      if (validateInput && typeof validateInput === 'function') {
        const validationResult = validateInput(...args);
        if (validationResult !== true) throw new Error(`Input validation failed: ${validationResult}`);
      }

      let result;
      if (timeoutMs && timeoutMs > 0) {
        result = await executeWithTimeout(fn, args, timeoutMs);
      } else if (retryCount > 0) {
        result = await executeWithRetry(fn, args, retryCount, retryDelay);
      } else {
        result = await fn(...args);
      }

      if (validateOutput && typeof validateOutput === 'function') {
        const validationResult = validateOutput(result);
        if (validationResult !== true) throw new Error(`Output validation failed: ${validationResult}`);
      }

      logExecution && logger.log(`[ExecHelper] Completed ${wrapperContext}`);

      logPerformance && startTime && (() => {
        const executionTime = Date.now() - startTime;
        logger.log(`[ExecHelper] Performance ${wrapperContext}: ${executionTime}ms`);
      })();

      return result;
    } catch (error) {
      let finalError = error;

      if (errorTransform && typeof errorTransform === 'function') {
        try {
          finalError = errorTransform(error);
        } catch (transformError) {
          logErrors && logger.error(`[ExecHelper] Error transformation failed:`, transformError);
        }
      }

      logErrors && logger.error(`[ExecHelper] Error in ${wrapperContext}:`, finalError.message);

      throw finalError;
    }
  };
};

const executeWithTimeout = async (fn, args, timeoutMs) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Function execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    Promise.resolve(fn(...args))
      .then(result => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
  });
};

const executeWithRetry = async (fn, args, retryCount, retryDelay) => {
  let lastError;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error;

      if (error.statusCode === 400 || error.statusCode === 401 || error.statusCode === 403) throw error;

      if (attempt === retryCount) throw error;

      retryDelay > 0 && await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
};

module.exports = execHelperWrapper;
