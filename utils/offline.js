
/**
 * Offline-aware error logging utility
 * @param {Error} error - The error to log
 * @param {string} functionName - The name of the function where the error occurred
 * @param {object} context - Additional context about the error
 */
function qerrors(error, functionName, context = {}) {
  console.error(`Error in ${functionName}:`, error.message);
  if (Object.keys(context).length > 0) {
    console.error('Context:', context);
  }
}

module.exports = {
  qerrors
};
