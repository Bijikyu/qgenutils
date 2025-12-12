/**
 * Create Exec Helper Factory
 * 
 * Creates an exec helper instance with default options for consistent
 * function wrapping across a service or module.
 * 
 * @param {object} [defaultOptions] - Default options for all wrappers
 * @returns {object} Exec helper instance with wrap method
 */
const execHelperWrapper = require('./execHelperWrapper'); // rationale: core wrapper function

function createExecHelper(defaultOptions = {}) {
  return {
    /**
     * Wrap a function with exec helper functionality
     * @param {Function} fn - Function to wrap
     * @param {object} [options] - Additional options (merged with defaults)
     * @returns {Function} Wrapped function
     */
    wrap(fn, options = {}) {
      return execHelperWrapper(fn, { ...defaultOptions, ...options });
    },

    /**
     * Get the default options
     * @returns {object} Default options
     */
    getDefaults() {
      return { ...defaultOptions };
    }
  };
}

module.exports = createExecHelper;
