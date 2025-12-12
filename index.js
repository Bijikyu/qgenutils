
/*
 * Main Module Entry Point - SRP Architecture
 * 
 * This file serves as the central export hub for all utility functions following
 * Single Responsibility Principle (SRP) where each function has its own file.
 * 
 * RATIONALE FOR SRP APPROACH:
 * 1. Single Responsibility: Each file contains exactly one function
 * 2. Maintainability: Changes to one function don't affect others
 * 3. Testability: Individual functions can be tested in complete isolation
 * 4. Code Organization: Clear function-to-file mapping improves navigation
 * 5. Tree Shaking: Bundlers can optimize imports at the function level
 * 
 * Architecture follows "one function per file" principle as specified in
 * AGENTS.md and .roo/rules/architecture.md for maximum modularity.
 */

// Import all utility functions from SRP-compliant individual function files
// Each require() statement imports a single function following Single Responsibility Principle
const logger = require('./lib/logger'); // winston logger

// DateTime utilities - individual functions
const formatDateTime = require('./lib/utilities/datetime/formatDateTime');
const formatDuration = require('./lib/utilities/datetime/formatDuration');
const addDays = require('./lib/utilities/datetime/addDays');
const formatDate = require('./lib/utilities/datetime/formatDate');
const formatDateWithPrefix = require('./lib/utilities/datetime/formatDateWithPrefix');





// Validation utilities - individual functions
const requireFields = require('./lib/validation/requireFields');

// Authentication utilities - individual functions
const checkPassportAuth = require('./lib/security/auth/checkPassportAuth');
const hasGithubStrategy = require('./lib/security/auth/hasGithubStrategy');

// URL utilities - individual functions
const ensureProtocol = require('./lib/utilities/url/ensureProtocol');
const normalizeUrlOrigin = require('./lib/utilities/url/normalizeUrlOrigin');
const stripProtocol = require('./lib/utilities/url/stripProtocol');
const parseUrlParts = require('./lib/utilities/url/parseUrlParts');



// Environment utilities - individual functions
const requireEnvVars = require('./lib/system/env/requireEnvVars');
const hasEnvVar = require('./lib/system/env/hasEnvVar');
const getEnvVar = require('./lib/system/env/getEnvVar');



// Real-time communication utilities - individual functions
const createBroadcastRegistry = require('./lib/system/realtime/createBroadcastRegistry');

// ID generation utilities - individual functions
const generateExecutionId = require('./lib/utilities/id-generation/generateExecutionId');

// String sanitization utilities - individual functions
const sanitizeString = require('./lib/utilities/string/sanitizeString');

// Advanced security utilities - individual functions following SRP
const sanitizeHtml = require('./lib/security/sanitizeHtml');
const sanitizeSqlInput = require('./lib/security/sanitizeSqlInput'); 
const validateInputRate = require('./lib/security/validateInputRate');
const sanitizeObjectRecursively = require('./lib/security/sanitizeObjectRecursively');
const validateUserInput = require('./lib/security/validateUserInput');

// GitHub validation utilities - individual functions
const validateGitHubUrl = require('./lib/validation/validateGitHubUrl');

// Advanced validation utilities - individual functions
const validateEmail = require('./lib/validation/validateEmail');
const validateRequired = require('./lib/validation/validateRequired');

// File utilities - individual functions
const formatFileSize = require('./lib/utilities/file/formatFileSize');

// Performance monitoring utilities - safe timer handling
const safeDurationFromTimer = require('./lib/utilities/performance/safeDurationFromTimer');
const createSafeDurationExtractor = require('./lib/utilities/performance/createSafeDurationExtractor');

// Function utilities - ergonomic function wrapping
const createDualVersionFunction = require('./lib/utilities/function/createDualVersionFunction');

// Worker pool utilities - individual functions
const createWorkerPool = require('./lib/system/worker-pool/createWorkerPool');

// Shutdown utilities - individual functions
const createShutdownManager = require('./lib/system/shutdown/createShutdownManager');
const gracefulShutdown = require('./lib/system/shutdown/gracefulShutdown');

// Input validation utilities - individual functions
const isValidObject = require('./lib/validation/isValidObject');
const isValidString = require('./lib/validation/isValidString');
const isValidDate = require('./lib/validation/isValidDate');
const hasMethod = require('./lib/validation/hasMethod');

// Throwing validation utilities - fail-fast validation with custom error messages
const validateInputObject = require('./lib/validation/validateInputObject');
const validateInputString = require('./lib/validation/validateInputString');
const validateRequiredFields = require('./lib/validation/validateRequiredFields');

// Non-throwing validation utilities - structured result objects for API responses
const validateInputObjectObj = require('./lib/validation/validateInputObjectObj');
const validateInputStringObj = require('./lib/validation/validateInputStringObj');
const validateRequiredFieldsObj = require('./lib/validation/validateRequiredFieldsObj');


/*
 * Export Strategy Explanation:
 *
 * All utilities are re-exported from this file to provide a single entry point
 * for the SRP-structured functions. Each function is imported from its individual
 * file and exported here for convenient access.
 *
 * This approach allows bundlers to tree shake unused functions at the individual
 * function level while maintaining a clean API surface. The SRP structure makes
 * it easy for developers to understand exactly what each function does.
 *
 * ES module compatibility is maintained through the default export strategy.
 */

// Export all functions from SRP structure
// Each function is imported from its individual file following SRP principles
module.exports = {
  // DateTime utilities - handle date formatting, duration calculations, and date arithmetic
  formatDateTime, // convert a Date to a locale string for UIs
  formatDuration, // return human readable elapsed time
  addDays, // calculate future dates for business logic and expiration handling
  formatDate, // format date with locale support and fallback handling
  formatDateWithPrefix, // format date with contextual prefix (e.g., "Added 12/25/2023")
  


  // URL utilities - handle protocol normalization and URL parsing
  ensureProtocol, // prefix http/https when missing
  normalizeUrlOrigin, // normalize origin for comparisons
  stripProtocol, // remove http/https scheme from URL
  parseUrlParts, // split URL into host and path
  
  // Validation utilities - field presence and format checking
  requireFields, // confirm required request fields exist
  
  // Authentication utilities - Passport.js integration helpers
  checkPassportAuth, // verify request authenticated via Passport
  hasGithubStrategy, // detect configured GitHub strategy
  

  
  // Environment utilities - configuration validation and access
  requireEnvVars, // validate presence of required environment variables
  hasEnvVar, // check if single environment variable exists
  getEnvVar, // get environment variable value with optional default
  

  
  // Real-time communication utilities - socket.io broadcast registries and validation
  createBroadcastRegistry, // factory to create custom broadcast function registries
  
  // ID generation utilities - secure identifier creation for tracking and data integrity
  generateExecutionId, // create unique identifiers for request tracking and logging
  
  // String sanitization utilities - security-focused content filtering
  sanitizeString, // remove dangerous characters from user input
  
  // Advanced security utilities - comprehensive input protection
  sanitizeHtml, // strip XSS vulnerabilities from HTML content
  sanitizeSqlInput, // prevent SQL injection in database queries
  validateInputRate, // rate limiting for DoS prevention
  sanitizeObjectRecursively, // recursively sanitize nested objects and arrays
  validateUserInput, // advanced input validation with size constraints
  
  // GitHub validation utilities - repository URL format checking
  validateGitHubUrl, // validate GitHub repository URLs
  
  // Advanced validation utilities - comprehensive field validation
  validateEmail, // check email format with security considerations
  validateRequired, // ensure required fields are present and valid
  
  // File utilities - file system helper functions
  formatFileSize, // convert bytes to human-readable format
  
  // Performance monitoring utilities - safe timer handling
  safeDurationFromTimer, // safely extract duration from timer objects
  createSafeDurationExtractor, // factory for bound duration extraction functions
  
  // Function utilities - ergonomic function wrapping
  createDualVersionFunction, // wrap functions to accept both spread args and object input
  
  // Worker pool utilities - CPU-intensive task management
  createWorkerPool, // manage worker threads for parallel processing
  
  // Shutdown utilities - graceful application termination
  createShutdownManager, // coordinate clean shutdown processes
  gracefulShutdown, // handle process termination signals
  
  // Input validation utilities - type and format checking
  isValidObject, // verify object structure and properties
  isValidString, // check string validity with security considerations
  isValidDate, // validate Date object integrity
  hasMethod, // check if object has specific method
  
  // Throwing validation utilities - fail-fast validation with custom error messages
  validateInputObject, // throw if not a valid plain object
  validateInputString, // throw if not a valid non-empty string
  validateRequiredFields, // throw if required fields are missing (framework-agnostic)
  
  // Non-throwing validation utilities - structured result objects for batch/API processing
  validateInputObjectObj, // returns {isValid: boolean}
  validateInputStringObj, // returns {isValid: boolean}
  validateRequiredFieldsObj, // returns {isValid: boolean, missingFields: string[]}
  
  // Logger - centralized logging infrastructure
  logger // winston-based logging with rotation and levels
};

/*
 * ES Module Compatibility:
 * 
 * Some bundlers and newer Node.js versions expect a 'default' export property
 * for ES module interoperability. Setting module.exports.default = module.exports
 * allows this module to work with both:
 * - const utils = require('./index.js') (CommonJS)
 * - import utils from './index.js' (ES modules)
 * 
 * This ensures maximum compatibility across different JavaScript environments.
 */

// Mirror exports under 'default' to support import statements  // clarify ESM usage
module.exports.default = module.exports; // provide default export for import syntax
