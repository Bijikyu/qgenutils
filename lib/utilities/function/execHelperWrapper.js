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
function execHelperWrapper(fn, options = {}) {
  if (typeof fn !== 'function') {
    throw new Error('Function to wrap must be a valid function');
  }

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

  if (retryCount > 0 && retryDelay <= 0) { // validate retry configuration
    throw new Error('retryDelay must be positive when retryCount > 0');
  }

  const functionName = fn.name || 'anonymous';
  const wrapperContext = `${context}:${functionName}`;

  return async function wrappedFunction(...args) {
    const startTime = logPerformance ? Date.now() : null;

    try {
      if (logExecution) { // log execution start
        logger.log(`[ExecHelper] Starting ${wrapperContext}`);
      }

      if (validateInput && typeof validateInput === 'function') { // validate input
        const validationResult = validateInput(...args);
        if (validationResult !== true) {
          throw new Error(`Input validation failed: ${validationResult}`);
        }
      }

      let result;
      if (timeoutMs && timeoutMs > 0) { // execute with timeout
        result = await executeWithTimeout(fn, args, timeoutMs);
      } else if (retryCount > 0) { // execute with retry
        result = await executeWithRetry(fn, args, retryCount, retryDelay);
      } else { // execute directly
        result = await fn(...args);
      }

      if (validateOutput && typeof validateOutput === 'function') { // validate output
        const validationResult = validateOutput(result);
        if (validationResult !== true) {
          throw new Error(`Output validation failed: ${validationResult}`);
        }
      }

      if (logExecution) { // log completion
        logger.log(`[ExecHelper] Completed ${wrapperContext}`);
      }

      if (logPerformance && startTime) { // log performance
        const executionTime = Date.now() - startTime;
        logger.log(`[ExecHelper] Performance ${wrapperContext}: ${executionTime}ms`);
      }

      return result;
    } catch (error) {
      let finalError = error;

      if (errorTransform && typeof errorTransform === 'function') { // transform error
        try {
          finalError = errorTransform(error);
        } catch (transformError) {
          if (logErrors) {
            logger.error(`[ExecHelper] Error transformation failed:`, transformError);
          }
        }
      }

      if (logErrors) { // log error
        logger.error(`[ExecHelper] Error in ${wrapperContext}:`, finalError.message);
      }

      throw finalError;
    }
  };
}

async function executeWithTimeout(fn, args, timeoutMs) { // execute function with timeout
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
}

async function executeWithRetry(fn, args, retryCount, retryDelay) { // execute function with retry
  let lastError;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error;

      if (error.statusCode === 400 || error.statusCode === 401 || error.statusCode === 403) { // don't retry client errors
        throw error;
      }

      if (attempt === retryCount) { // last attempt
        throw error;
      }

      if (retryDelay > 0) { // wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError;
}

module.exports = execHelperWrapper;
