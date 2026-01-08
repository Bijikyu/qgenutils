/**
 * Create Exec Helper Factory
 * 
 * Creates an exec helper instance with default options for consistent
 * function wrapping across a service or module.
 * 
 * @param {object} [defaultOptions] - Default options for all wrappers
 * @returns {object} Exec helper instance with wrap method
 */
import execHelperWrapper from './execHelperWrapper.js'; // rationale: core wrapper function

const createExecHelper = (defaultOptions = {}) => ({
  wrap(fn, options = {}) {
    return execHelperWrapper(fn, { ...defaultOptions, ...options });
  },
  getDefaults() {
    return { ...defaultOptions };
  }
});

export default createExecHelper;
