
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
const formatDateTime = require('./lib/datetime/formatDateTime');
const formatDuration = require('./lib/datetime/formatDuration');
const addDays = require('./lib/datetime/addDays');
const formatDate = require('./lib/datetime/formatDate');
const formatDateWithPrefix = require('./lib/datetime/formatDateWithPrefix');





// Validation utilities - individual functions
const requireFields = require('./lib/validation/requireFields');

// Authentication utilities - individual functions
const checkPassportAuth = require('./lib/auth/checkPassportAuth');
const hasGithubStrategy = require('./lib/auth/hasGithubStrategy');

// URL utilities - individual functions
const ensureProtocol = require('./lib/url/ensureProtocol');
const normalizeUrlOrigin = require('./lib/url/normalizeUrlOrigin');
const stripProtocol = require('./lib/url/stripProtocol');
const parseUrlParts = require('./lib/url/parseUrlParts');

// View utilities - individual functions
const renderView = require('./lib/views/renderView');

// Environment utilities - individual functions
const requireEnvVars = require('./lib/env/requireEnvVars');
const hasEnvVar = require('./lib/env/hasEnvVar');
const getEnvVar = require('./lib/env/getEnvVar');

// Browser utilities - individual functions
const makeCopyFn = require('./lib/browser/makeCopyFn');

// Real-time communication utilities - individual functions
const createBroadcastRegistry = require('./lib/realtime/createBroadcastRegistry');

// ID generation utilities - individual functions
const generateExecutionId = require('./lib/id-generation/generateExecutionId');

// String sanitization utilities - individual functions
const sanitizeString = require('./lib/string-utils/sanitizeString');

// GitHub validation utilities - individual functions
const validateGitHubUrl = require('./lib/github-validation/validateGitHubUrl');

// Advanced validation utilities - individual functions
const validateEmail = require('./lib/advanced-validation/validateEmail');
const validateRequired = require('./lib/advanced-validation/validateRequired');

// File utilities - individual functions
const formatFileSize = require('./lib/file-utils/formatFileSize');

// Worker pool utilities - individual functions
const createWorkerPool = require('./lib/worker-pool/createWorkerPool');

// Shutdown utilities - individual functions
const createShutdownManager = require('./lib/shutdown-utils/createShutdownManager');
const gracefulShutdown = require('./lib/shutdown-utils/gracefulShutdown');

// Input validation utilities - individual functions
const isValidObject = require('./lib/input-validation/isValidObject');
const isValidString = require('./lib/input-validation/isValidString');
const hasMethod = require('./lib/input-validation/hasMethod');


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
  
  // View utilities - template rendering
  renderView, // render EJS template with data
  
  // Environment utilities - configuration validation and access
  requireEnvVars, // validate presence of required environment variables
  hasEnvVar, // check if single environment variable exists
  getEnvVar, // get environment variable value with optional default
  
  // Browser utilities - client-side functionality and clipboard operations
  makeCopyFn, // factory to create clipboard copy handlers with feedback
  
  // Real-time communication utilities - socket.io broadcast registries and validation
  createBroadcastRegistry, // factory to create custom broadcast function registries
  
  // ID generation utilities - secure identifier creation for tracking and data integrity
  generateExecutionId, // create unique execution IDs with timestamp and random component
  
  // String sanitization utilities - security-first string processing
  sanitizeString, // remove dangerous characters and normalize whitespace
  
  // GitHub validation utilities - repository URL and format validation
  validateGitHubUrl, // validate GitHub repository URL format with strict pattern matching
  
  // Advanced validation utilities - comprehensive field validation with error reporting
  validateEmail, // validate email address format using standard regex patterns
  validateRequired, // validate required text fields with optional minimum length
  
  // File utilities - file operations and formatting for storage management and UI display
  formatFileSize, // format file size in bytes to human-readable string with appropriate units
  
  // Worker pool utilities - CPU-intensive task management with automatic worker replacement
  createWorkerPool, // create and manage pool of worker threads for parallel processing
  
  // Shutdown utilities - graceful application termination and resource cleanup
  createShutdownManager, // create configurable shutdown manager with priority-based cleanup
  gracefulShutdown, // simple graceful shutdown for basic server applications

  // Input validation utilities - type checking and validation helpers
  isValidObject, // check if value is a plain object (not null, array, or primitive)
  isValidString, // validate non-empty string with trimmed whitespace handling
  hasMethod, // safely check if object has callable method

  // Logger utility
  logger // winston structured logger for application logging
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
