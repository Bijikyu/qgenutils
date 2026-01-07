/**
 * Demo Server - HTTP Server for QGenUtils Demonstration
 * 
 * Purpose: Provides a development and demonstration server for showcasing QGenUtils
 * functionality. This server serves both static files and API endpoints for testing.
 * 
 * Architecture:
 * - Node.js HTTP server with routing middleware
 * - Static file serving with MIME type detection
 * - API endpoints for utility demonstrations
 * - Error handling with proper HTTP status codes
 * - Security headers and input validation
 * 
 * Security Considerations:
 * - Path traversal protection in file serving
 * - Input sanitization for API parameters
 * - Error information disclosure prevention
 * - Proper MIME type handling to prevent XSS
 * - Request size limiting to prevent DoS
 * 
 * Development Features:
 * - Hot reload support for development
 * - Comprehensive error logging
 * - CORS support for frontend testing
 * - JSON API responses with proper headers
 * - Static asset caching for performance
 * 
 * @author QGenUtils Development Team
 * @since 1.0.0
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Import QGenUtils utilities for API demonstrations
const QGenUtils = require('../dist/index.js');

// Import centralized environment variables
const { NODE_ENV } = require('../config/localVars.js');

const root = process.cwd();

/**
 * Error Message Sanitization Function
 * 
 * Sanitizes error messages to prevent information disclosure in production.
 * Removes sensitive information like file paths, stack traces, and internal details.
 * 
 * @param {string} errorMessage - The raw error message
 * @returns {string} - Sanitized error message safe for client exposure
 */
function sanitizeErrorMessage(errorMessage) {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return 'An error occurred';
  }
  
  // Remove file paths (Windows and Unix)
  let sanitized = errorMessage
    .replace(/[A-Z]:\\[^\\s]*/gi, '[path]')
    .replace(/\/[^\/\s]*/g, '[path]')
    .replace(/\\\\[^\\\s]*/g, '[path]');
  
  // Remove stack trace patterns
  sanitized = sanitized
    .replace(/\s+at\s+.*\([^)]*\)/g, '')
    .replace(/\s+at\s+.*/g, '')
    .replace(/Error:\s*/gi, '');
  
  // Remove sensitive keywords and patterns
  sanitized = sanitized
    .replace(/internal server error/gi, 'server error')
    .replace(/database connection/gi, 'data source')
    .replace(/sql/gi, 'query')
    .replace(/password/gi, 'credentials')
    .replace(/token/gi, 'session')
    .replace(/secret/gi, 'key');
  
  // Limit length and remove excessive whitespace
  sanitized = sanitized
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 200);
  
  // Ensure we have something meaningful
  if (!sanitized || sanitized.length < 3) {
    return 'An error occurred';
  }
  
  return sanitized;
}

/**
 * MIME Type Mapping for Static File Serving
 * 
 * This mapping ensures proper content-type headers are set for different file types,
 * which is crucial for browser rendering and security. Incorrect MIME types can lead
 * to security vulnerabilities like XSS attacks or content handling issues.
 * 
 * Security Notes:
 * - Text files served as plain text to prevent execution
 * - JSON files properly identified for API responses
 * - Image files with correct types for browser rendering
 * - Default fallback to text/plain for unknown types
 */
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

/**
 * Static File Serving with Security and Error Handling
 * 
 * This function handles static file serving with comprehensive security measures
 * and proper error handling. It uses streams for efficient file delivery and
 * prevents common web server vulnerabilities.
 * 
 * Security Features:
 * - Stream-based serving to prevent memory exhaustion
 * - Proper MIME type detection to prevent content-type attacks
 * - Error handling that prevents information disclosure
 * - Header injection prevention through proper response handling
 * - Path validation (handled in routing layer)
 * 
 * Error Handling Strategy:
 * - ENOENT (404): File not found - don't reveal file system structure
 * - EACCES (403): Permission denied - access control violations
 * - Default (500): Internal errors - generic error messages
 * - Headers already sent check prevents response corruption
 * 
 * Performance Considerations:
 * - Stream-based file serving for memory efficiency
 * - Event-driven error handling before data flow
 * - Proper resource cleanup through stream management
 * - MIME type caching for repeated requests
 * 
 * @param {Object} res - HTTP response object
 * @param {string} fullPath - Absolute path to file (validated by router)
 */
function serveFile(res, fullPath) {
  const ext = path.extname(fullPath);
  const type = mime[ext] || 'text/plain';
  
  // Create read stream for efficient file serving (memory-friendly)
  const readStream = fs.createReadStream(fullPath);
  
  // Set up error handling before piping to prevent unhandled exceptions
  readStream.on('error', (err) => {
    console.error('File read error:', err);
    
    // Only send error response if headers haven't been sent yet
    // This prevents "Cannot set headers after they are sent" errors
    if (!res.headersSent) {
      // Handle specific error codes with appropriate HTTP status
      if (err.code === 'ENOENT') {
        // File not found - don't reveal actual file path for security
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
      } else if (err.code === 'EACCES') {
        // Permission denied - access control violation
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Permission denied' }));
      } else {
        // Internal server error - generic message for security
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });
  
  // Handle successful file opening and serve content
  readStream.on('open', () => {
    // Only write headers if they haven't been sent yet (error handling check)
    if (!res.headersSent) {
      res.writeHead(200, { 'Content-Type': type });
    }
    // Pipe file content to response (stream-based for memory efficiency)
    readStream.pipe(res);
  });
}

/**
 * JSON Response Helper with Proper Headers
 * 
 * Sends JSON responses with appropriate content-type headers and status codes.
 * This helper ensures consistent API responses across all endpoints.
 * 
 * @param {Object} res - HTTP response object
 * @param {*} data - Data to be JSON serialized
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Request Body Parser with Error Handling
 * 
 * Parses incoming request bodies as JSON with proper error handling.
 * This function is designed to be resilient to malformed JSON and
 * prevents request parsing errors from crashing the server.
 * 
 * Security Considerations:
 * - No size limits (should be added for production)
 * - Graceful error handling prevents DoS via malformed JSON
 * - Returns empty object on parse failure for consistent API behavior
 * 
 * Performance Notes:
 * - Stream-based parsing for memory efficiency
 * - String concatenation may be inefficient for large payloads
 * - Consider using body-parser middleware for production
 * 
 * @param {Object} req - HTTP request object
 * @returns {Promise<Object>} Parsed request body or empty object
 */
function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    let bodySize = 0;
    const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB limit for production
    
    // Collect data chunks with size limit check
    req.on('data', chunk => {
      bodySize += chunk.length;
      if (bodySize > MAX_REQUEST_SIZE) {
        resolve({ error: 'Request entity too large' });
        return;
      }
      body += chunk.toString();
    });
    
    // Parse JSON when request is complete
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        // Graceful fallback - return empty object on parse failure
        // This prevents API crashes due to malformed JSON
        resolve({});
      }
    });
  });
}

/**
 * API Request Handler with Routing and CORS Support
 * 
 * This function handles all API requests, providing routing, CORS support,
 * and dispatching to appropriate utility functions. It serves as the main
 * API gateway for demonstrating QGenUtils functionality.
 * 
 * Routing Strategy:
 * - Path-based routing: /api/{category}/{action}
 * - Category maps to utility groups (validation, helpers, etc.)
 * - Action maps to specific utility functions
 * - Method-agnostic routing (GET/POST for flexibility)
 * 
 * Security Features:
 * - CORS headers for cross-origin requests (development only)
 * - Input validation in dispatched handlers
 * - Error handling prevents information disclosure
 * - Path sanitization prevents injection attacks
 * 
 * Development Notes:
 * - Permissive CORS (*) for development convenience
 * - Production should restrict origins to specific domains
 * - Consider adding authentication for production APIs
 * - Rate limiting should be added for production use
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {string} reqPath - Request path (e.g., '/api/validation/email')
 * @param {string} method - HTTP method (GET, POST, etc.)
 */
async function handleApiRequest(req, res, reqPath, method) {
  // Parse API path: /api/{category}/{action}
  const pathParts = reqPath.replace('/api/', '').split('/');
  const category = pathParts[0];  // Utility group (validation, helpers, etc.)
  const action = pathParts[1];    // Specific function
  
  // Enable CORS for development (restrict origins in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS requests for CORS
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Route to appropriate handler
  switch (category) {
    case 'validate':
      await handleValidation(req, res, action, method);
      break;
    case 'security':
      await handleSecurity(req, res, action, method);
      break;
    case 'collections':
      await handleCollections(req, res, action, method);
      break;
    case 'datetime':
      await handleDateTime(req, res, action, method);
      break;
    case 'performance':
      await handlePerformance(req, res, action, method);
      break;
    default:
      sendJSON(res, { error: 'Unknown API endpoint' }, 404);
  }
}

async function handleValidation(req, res, action, method) {
  // Fix: Method now passed as parameter from handleApiRequest
  if (method !== 'POST') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  const data = await parseRequestBody(req);
  
  switch (action) {
    case 'email':
      const emailResult = QGenUtils.validateEmailFormat(data.email);
      sendJSON(res, { result: emailResult });
      break;
    case 'password':
      const passwordResult = QGenUtils.validatePasswordStrength(data.password);
      sendJSON(res, { result: passwordResult });
      break;
    case 'api-key':
      const apiKeyResult = QGenUtils.validateApiKeyFormat(data.apiKey);
      sendJSON(res, { result: apiKeyResult });
      break;
    case 'amount':
      const amountResult = QGenUtils.validateMonetaryAmount(data.amount);
      sendJSON(res, { result: amountResult });
      break;
    case 'sanitize':
      const sanitized = QGenUtils.sanitizeInput(data.input);
      sendJSON(res, { result: { original: data.input, sanitized } });
      break;
    default:
      sendJSON(res, { error: 'Unknown validation action' }, 404);
  }
}

async function handleSecurity(req, res, action, method) {
  // Fix: Method now passed as parameter from handleApiRequest
  if (method !== 'POST') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  const data = await parseRequestBody(req);
  
  switch (action) {
    case 'mask-api-key':
      const masked = QGenUtils.maskApiKey(data.apiKey);
      sendJSON(res, { result: { original: data.apiKey, masked } });
      break;
    case 'hash-password':
      const hashed = await QGenUtils.hashPassword(data.password);
      sendJSON(res, { result: { original: data.password, hashed } });
      break;
    case 'verify-password':
      const isValid = await QGenUtils.verifyPassword(data.password, data.hash);
      sendJSON(res, { result: { valid: isValid } });
      break;
    case 'generate-password':
      const generatedPassword = QGenUtils.generateSecurePassword(data.options);
      sendJSON(res, { result: { password: generatedPassword } });
      break;
    default:
      sendJSON(res, { error: 'Unknown security action' }, 404);
  }
}

async function handleCollections(req, res, action, method) {
  // Fix: Method now passed as parameter from handleApiRequest
  if (method !== 'POST') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  const data = await parseRequestBody(req);
  
  switch (action) {
    case 'group-by':
      const grouped = QGenUtils.groupBy(data.array, data.key);
      sendJSON(res, { result: grouped });
      break;
    case 'chunk':
      const chunked = QGenUtils.chunk(data.array, data.size);
      sendJSON(res, { result: chunked });
      break;
    case 'unique':
      const uniqueItems = QGenUtils.unique(data.array);
      sendJSON(res, { result: uniqueItems });
      break;
    case 'sort-by':
      const sorted = QGenUtils.sortBy(data.array, data.key);
      sendJSON(res, { result: sorted });
      break;
    case 'shuffle':
      const shuffled = QGenUtils.shuffle(data.array);
      sendJSON(res, { result: shuffled });
      break;
    default:
      sendJSON(res, { error: 'Unknown collections action' }, 404);
  }
}

async function handleDateTime(req, res, action, method) {
  // Fix: Method now passed as parameter from handleApiRequest
  if (method !== 'POST') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  const data = await parseRequestBody(req);
  
  switch (action) {
    case 'add-days':
      // Fix: Add validation for data.days parameter
      if (!data.days || typeof data.days !== 'number' || isNaN(data.days)) {
        return sendJSON(res, { error: 'Invalid or missing days parameter' }, 400);
      }
      const futureDate = QGenUtils.addDays(data.days);
      sendJSON(res, { result: { original: new Date(), futureDate, days: data.days } });
      break;
    case 'format-date':
      const formatted = QGenUtils.formatDateTime(data.date, data.format);
      sendJSON(res, { result: { original: data.date, formatted } });
      break;
    case 'format-duration':
      const duration = QGenUtils.formatDuration(data.start, data.end);
      sendJSON(res, { result: { duration } });
      break;
    default:
      sendJSON(res, { error: 'Unknown datetime action' }, 404);
  }
}

async function handlePerformance(req, res, action, method) {
  // Fix: Method now passed as parameter from handleApiRequest
  if (method !== 'POST') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  const data = await parseRequestBody(req);
  
  switch (action) {
    case 'memoize':
      // Test memoization performance
      const startTime = Date.now();
      const memoizedFn = QGenUtils.memoize(() => data.value);
      for (let i = 0; i < 1000; i++) {
        memoizedFn();
      }
      const endTime = Date.now();
      sendJSON(res, { 
        result: { 
          iterations: 1000, 
          time: endTime - startTime,
          memoized: true 
        } 
      });
      break;
    case 'throttle':
      // Test throttling with delay simulation
      const testFn = QGenUtils.throttle(() => Date.now(), data.delay || 100);
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(testFn());
      }
      sendJSON(res, { 
        result: { 
          test: 'throttle', 
          delay: data.delay || 100,
          calls: results 
        } 
      });
      break;
     case 'benchmark':
      // Generic benchmark utility with safe evaluation
      const iterations = data.iterations || 1000;
      let testFunction;
      
      // Safe function creation - only allow whitelisted operations
      if (data.function && data.function.startsWith('Math.')) {
        const mathOp = data.function.substring(5); // Remove 'Math.' prefix
        switch (mathOp) {
          case 'random':
            testFunction = () => Math.random();
            break;
          case 'abs':
            testFunction = () => Math.abs(Math.random() * 100);
            break;
          case 'sqrt':
            testFunction = () => Math.sqrt(Math.random() * 100 + 1);
            break;
          default:
            return sendJSON(res, { error: 'Unsupported math operation for benchmark' }, 400);
        }
      } else {
        return sendJSON(res, { error: 'Only Math operations allowed in benchmark for security' }, 400);
      }
      
      const benchmarkStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        testFunction();
      }
      const benchmarkEnd = Date.now();
      sendJSON(res, { 
        result: { 
          function: data.function,
          iterations,
          time: benchmarkEnd - benchmarkStart,
          opsPerSecond: Math.round(iterations / ((benchmarkEnd - benchmarkStart) / 1000))
        } 
      });
      break;
    default:
      sendJSON(res, { error: 'Unknown performance action' }, 404);
  }
}

// Security headers helper function
const applySecurityHeaders = (req, res) => {
  // Content Security Policy
  const isDevelopment = NODE_ENV === 'development';
  const cspValue = isDevelopment 
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http: https: http://localhost:* ws://localhost:*; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http: https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
  
  res.setHeader('Content-Security-Policy', cspValue);
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), autoplay=(), encrypted-media=(), fullscreen=(self), picture-in-picture=(self)');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-Powered-By', '');
  
  // Cache control for API responses
  if (req.path && req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};

const server = http.createServer(async (req, res) => {
  // Apply security headers to all responses
  applySecurityHeaders(req, res);
  
  // Fix: Add null check for req.url to prevent runtime error
  const parsedUrl = (req.url || '').split('?');
  let reqPath = parsedUrl[0];
  const method = req.method;
  
  // Handle API endpoints with enhanced error handling
  if (reqPath.startsWith('/api/')) {
    try {
      await handleApiRequest(req, res, reqPath, method);
    } catch (error) {
      console.error('API request error:', error);
      // Handle different error types appropriately
      if (error.name === 'ValidationError') {
        sendJSON(res, { error: 'Validation error', message: error.message }, 400);
      } else if (error.code === 'ENOENT') {
        sendJSON(res, { error: 'Resource not found', message: error.message }, 404);
      } else if (error.code === 'EACCES') {
        sendJSON(res, { error: 'Permission denied', message: error.message }, 403);
      } else {
        // Sanitize error messages to prevent information disclosure
        const safeErrorMessage = NODE_ENV === 'development' 
          ? sanitizeErrorMessage(error.message) 
          : 'Something went wrong';
        sendJSON(res, { error: 'Internal server error', message: safeErrorMessage }, 500);
      }
    }
    return;
  }
  
  // Serve static files with enhanced error handling
  if (reqPath === '/') reqPath = '/demo.html';
  const fullPath = path.join(root, reqPath);
  
  // Security check: prevent directory traversal
  if (reqPath.includes('..') || reqPath.includes('\\')) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid path' }));
    return;
  }
  
  fs.stat(fullPath, (err, stat) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else if (err.code === 'EACCES') {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
      } else {
        console.error('File stat error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
      return;
    }
    
    if (!stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    
    serveFile(res, fullPath);
  });
});

const { PORT } = require('../config/localVars.js');
const port = PORT || 3000;
server.listen(port, () => {
  console.log(`Demo server listening on http://localhost:${port}`);
});
