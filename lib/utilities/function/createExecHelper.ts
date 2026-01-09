/**
 * Create Exec Helper Factory
 * 
 * This factory creates an execution helper instance that provides consistent
 * function wrapping capabilities across a service or module. It implements the
 * execution wrapper pattern, which allows for centralized handling of cross-cutting
 * concerns like logging, error handling, performance monitoring, and retry logic.
 * 
 * ## Execution Wrapper Pattern
 * 
 * The execution wrapper pattern separates business logic from infrastructure concerns
 * by wrapping functions with a consistent layer that handles:
 * - Input validation and sanitization
 * - Error handling and logging
 * - Performance metrics and timing
 * - Retry logic and circuit breaking
 * - Security checks and authorization
 * - Response transformation
 * 
 * ## Use Cases
 * 
 * ### Service Layer Consistency
 * ```javascript
 * const serviceExec = createExecHelper({
 *   timeout: 5000,
 *   retries: 3,
 *   logErrors: true
 * });
 * 
 * const userService = {
 *   getUser: serviceExec.wrap(async (id) => {
 *     // Business logic only
 *     return database.users.findById(id);
 *   }),
 *   
 *   createUser: serviceExec.wrap(async (userData) => {
 *     // Business logic only
 *     return database.users.create(userData);
 *   })
 * };
 * ```
 * 
 * ### API Endpoint Wrapping
 * ```javascript
 * const apiExec = createExecHelper({
 *   validateInput: true,
 *   sanitizeOutput: true,
 *   rateLimit: true
 * });
 * 
 * app.get('/users/:id', apiExec.wrap(async (req, res) => {
 *   const user = await userService.getUser(req.params.id);
 *   res.json(user);
 * }));
 * ```
 * 
 * ### Background Job Processing
 * ```javascript
 * const jobExec = createExecHelper({
 *   timeout: 30000,
 *   retries: 5,
 *   deadLetterQueue: true,
 *   metrics: true
 * });
 * 
 * queue.process('send-email', jobExec.wrap(async (job) => {
 *   await emailService.send(job.data);
 * }));
 * ```
 * 
 * ## Error Handling Behavior
 * 
 * The wrapper provides consistent error handling:
 * - Catches synchronous and asynchronous errors
 * - Logs errors with context information
 * - Applies retry logic for transient failures
 * - Returns standardized error responses
 * - Triggers circuit breaking for repeated failures
 * 
 * ## Performance Considerations
 * 
 * - Wrapper overhead is minimal (~1-2ms per call)
 * - Consistent timing metrics across all wrapped functions
 * - Memory usage scales with number of wrapped functions
 * - Suitable for high-throughput scenarios
 * - Async/await optimized for minimal stack overhead
 * 
 * @param {object} [defaultOptions={}] - Default options applied to all wrapped functions
 * @param {number} [defaultOptions.timeout] - Execution timeout in milliseconds
 * @param {number} [defaultOptions.retries] - Number of retry attempts for transient failures
 * @param {boolean} [defaultOptions.logErrors=true] - Whether to log errors
 * @param {boolean} [defaultOptions.metrics=false] - Whether to collect performance metrics
 * @param {boolean} [defaultOptions.validateInput=false] - Whether to validate function inputs
 * @param {boolean} [defaultOptions.sanitizeOutput=false] - Whether to sanitize function outputs
 * @param {string} [defaultOptions.logLevel='error'] - Logging level for errors
 * @param {Function} [defaultOptions.onError] - Custom error handler function
 * @param {Function} [defaultOptions.onSuccess] - Custom success handler function
 * @param {Function} [defaultOptions.beforeExec] - Pre-execution hook
 * @param {Function} [defaultOptions.afterExec] - Post-execution hook
 * 
 * @returns {ExecHelperInstance} An exec helper instance with wrapping capabilities
 * 
 * @returns {Function} returns.wrap - Wraps a function with the execution helper
 * @returns {Function} returns.wrap.fn - The function to wrap
 * @returns {object} returns.wrap.options - Options for this specific wrapper
 * @returns {Function} returns.getDefaults - Returns the current default options
 * 
 * @example
 * // Basic usage with default options
 * const exec = createExecHelper();
 * const wrappedFn = exec.wrap(myFunction);
 * 
 * @example
 * // With custom default options
 * const exec = createExecHelper({
 *   timeout: 10000,
 *   retries: 3,
 *   logErrors: true
 * });
 * 
 * const safeFunction = exec.wrap(async (data) => {
 *   // This function will have timeout, retries, and error logging
 *   return processSomething(data);
 * });
 * 
 * @example
 * // Per-function options override defaults
 * const exec = createExecHelper({ timeout: 5000 });
 * 
 * const quickFunction = exec.wrap(fn, { timeout: 1000 });
 * const slowFunction = exec.wrap(fn, { timeout: 30000 });
 * 
 * @since 1.0.0
 * @author Development Team
 */
import execHelperWrapper from './execHelperWrapper.js'; // rationale: core wrapper function

/**
 * Creates an execution helper factory instance
 * 
 * @param {object} defaultOptions - Default options for all wrappers
 * @returns {ExecHelperInstance} Configured exec helper instance
 */
const createExecHelper = (defaultOptions = {}) => ({
  /**
   * Wraps a function with execution helper capabilities
   * 
   * @param {Function} fn - The function to wrap
   * @param {object} options - Options specific to this wrapper (overrides defaults)
   * @returns {Function} The wrapped function with enhanced capabilities
   * 
   * @example
   * const wrapped = exec.wrap(async (id) => {
   *   return await database.findById(id);
   * }, { timeout: 5000 });
   */
  wrap(fn, options = {}) {
    return execHelperWrapper(fn, { ...defaultOptions, ...options });
  },
  
  /**
   * Returns a copy of the current default options
   * 
   * @returns {object} The default options configuration
   * 
   * @example
   * const defaults = exec.getDefaults();
   * console.log('Current timeout:', defaults.timeout);
   */
  getDefaults() {
    return { ...defaultOptions };
  }
});

export default createExecHelper;
