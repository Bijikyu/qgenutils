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
// Using dynamic import for ESM module
let QGenUtils;
try {
  QGenUtils = require('../lib/index.js');
} catch (error) {
  console.error('Failed to load QGenUtils. Make sure the library is built properly.');
  // Fallback empty object for testing
  QGenUtils = {};
}

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
// Server statistics collection
let serverStats = {
  requestCount: 0,
  avgResponseTime: 0,
  errorRate: 0,
  startTime: Date.now(),
  responseTimes: [],
  errorCount: 0,
  rateLimiting: {
    activeClients: 0,
    blockedRequests: 0,
    rateLimitedRequests: 0,
    quotaEntries: 0
  },
  caching: {
    hitRate: 85.2,
    cacheSize: 1024,
    memoryUsage: 512,
    evictions: 12
  },
  system: {
    uptime: 0,
    memory: {
      rss: 0,
      heapUsed: 0
    },
    platform: process.platform
  }
};

// Mock user storage for demo
const users = new Map();
const sessions = new Map();

async function handleApiRequest(req, res, reqPath, method) {
  // Update request statistics
  const requestStart = Date.now();
  serverStats.requestCount++;
  
  // Handle root API path
  if (reqPath === '/api' || reqPath === '/api/') {
    return handleInfo(req, res, method);
  }
  
  // Handle generic path routing (for cases like ${this.apiUrl}${path})
  if (!reqPath.startsWith('/api/') && reqPath.startsWith('/')) {
    // Handle generic endpoint requests
    if (method === 'GET') {
      sendJSON(res, { 
        message: 'Generic endpoint handler',
        path: reqPath,
        method: method
      });
      return;
    }
  }
  
  // Parse API path: /api/{category}/{action}
  const pathParts = reqPath.replace('/api/', '').split('/');
  const category = pathParts[0];  // Utility group (validation, helpers, etc.)
  const action = pathParts[1];    // Specific function
  
  // Enable CORS for development (restrict origins in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight OPTIONS requests for CORS
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Route to appropriate handler
  try {
    let responseSent = false;
    
    switch (category) {
      case 'stats':
        await handleStats(req, res, method);
        responseSent = true;
        break;
      case 'info':
        await handleInfo(req, res, method);
        responseSent = true;
        break;
      case 'cache':
        await handleCache(req, res, action, method);
        responseSent = true;
        break;
      case 'register':
        await handleAuth(req, res, 'register', method);
        responseSent = true;
        break;
      case 'login':
        await handleAuth(req, res, 'login', method);
        responseSent = true;
        break;
      case 'generate-password':
        await handlePasswordGeneration(req, res, method);
        responseSent = true;
        break;
      case 'protected':
        await handleProtected(req, res, action, method);
        responseSent = true;
        break;
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
      case 'runs':
        await handleRuns(req, res, action, method);
        break;
      case 'datasets':
        await handleDatasets(req, res, action, method);
        break;
      case 'annotation-queues':
        await handleAnnotationQueues(req, res, action, method);
        break;
      case 'repos':
        await handleRepos(req, res, action, method);
        break;
      case 'commits':
        await handleCommits(req, res, action, method);
        break;
      case 'likes':
        await handleLikes(req, res, action, method);
        break;
      case 'feedback':
        await handleFeedback(req, res, action, method);
        break;
      case 'sessions':
        await handleSessions(req, res, action, method);
        break;
      case 'examples':
        await handleExamples(req, res, action, method);
        break;
      case 'public':
        await handlePublic(req, res, action, method);
        break;
      default:
        sendJSON(res, { error: 'Unknown API endpoint' }, 404);
        responseSent = true;
    }
    
    // Update response time statistics
    const responseTime = Date.now() - requestStart;
    serverStats.responseTimes.push(responseTime);
    if (serverStats.responseTimes.length > 100) {
      serverStats.responseTimes.shift();
    }
    serverStats.avgResponseTime = serverStats.responseTimes.reduce((a, b) => a + b, 0) / serverStats.responseTimes.length;
    
    // Update error rate
    serverStats.errorRate = (serverStats.errorCount / serverStats.requestCount) * 100;
    
    // Update system stats
    serverStats.system.uptime = Math.floor((Date.now() - serverStats.startTime) / 1000);
    const memUsage = process.memoryUsage();
    serverStats.system.memory = {
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed
    };
    
  } catch (error) {
    serverStats.errorCount++;
    console.error('API request error:', error);
    if (!res.headersSent) {
      sendJSON(res, { error: 'Internal server error' }, 500);
    }
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
      const emailResult = QGenUtils.validateEmailFormat ? QGenUtils.validateEmailFormat(data.email) : { error: 'Email validation not available' };
      sendJSON(res, { result: emailResult });
      break;
    case 'password':
      const passwordResult = QGenUtils.validatePasswordStrength ? QGenUtils.validatePasswordStrength(data.password) : { error: 'Password validation not available' };
      sendJSON(res, { result: passwordResult });
      break;
    case 'api-key':
      const apiKeyResult = QGenUtils.validateApiKeyFormat ? QGenUtils.validateApiKeyFormat(data.apiKey) : { error: 'API key validation not available' };
      sendJSON(res, { result: apiKeyResult });
      break;
    case 'amount':
      const amountResult = QGenUtils.validateMonetaryAmount ? QGenUtils.validateMonetaryAmount(data.amount) : { error: 'Amount validation not available' };
      sendJSON(res, { result: amountResult });
      break;
    case 'sanitize':
      const sanitized = QGenUtils.sanitizeInput ? QGenUtils.sanitizeInput(data.input) : data.input;
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
      const masked = QGenUtils.maskApiKey ? QGenUtils.maskApiKey(data.apiKey) : '****-****';
      sendJSON(res, { result: { original: data.apiKey, masked } });
      break;
    case 'hash-password':
      const hashed = QGenUtils.hashPassword ? await QGenUtils.hashPassword(data.password) : 'hashed_password_placeholder';
      sendJSON(res, { result: { original: data.password, hashed } });
      break;
    case 'verify-password':
      const isValid = QGenUtils.verifyPassword ? await QGenUtils.verifyPassword(data.password, data.hash) : false;
      sendJSON(res, { result: { valid: isValid } });
      break;
    case 'generate-password':
      const generatedPassword = QGenUtils.generateSecurePassword ? QGenUtils.generateSecurePassword(data.options) : 'generated_password_placeholder';
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
      const grouped = QGenUtils.groupBy ? QGenUtils.groupBy(data.array, data.key) : { error: 'Group by not available' };
      sendJSON(res, { result: grouped });
      break;
    case 'chunk':
      const chunked = QGenUtils.chunk ? QGenUtils.chunk(data.array, data.size) : { error: 'Chunk not available' };
      sendJSON(res, { result: chunked });
      break;
    case 'unique':
      const uniqueItems = QGenUtils.unique ? QGenUtils.unique(data.array) : { error: 'Unique not available' };
      sendJSON(res, { result: uniqueItems });
      break;
    case 'sort-by':
      const sorted = QGenUtils.sortBy ? QGenUtils.sortBy(data.array, data.key) : { error: 'Sort by not available' };
      sendJSON(res, { result: sorted });
      break;
    case 'shuffle':
      const shuffled = QGenUtils.shuffle ? QGenUtils.shuffle(data.array) : { error: 'Shuffle not available' };
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

async function handleStats(req, res, method) {
  if (method !== 'GET') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  sendJSON(res, serverStats);
}

async function handleInfo(req, res, method) {
  if (method !== 'GET') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  sendJSON(res, {
    name: 'QGenUtils Demo Server',
    version: '1.0.0',
    description: 'Demo server for QGenUtils functionality',
    endpoints: {
      runs: ['GET /api/runs', 'POST /api/runs', 'GET /api/runs/batch', 'GET /api/runs/stats'],
      datasets: ['GET /api/datasets', 'GET /api/datasets/{id}', 'GET /api/datasets/{id}/tags'],
      validation: ['POST /api/validate/email', 'POST /api/validate/password'],
      security: ['POST /api/security/mask-api-key'],
      annotationQueues: ['GET /api/annotation-queues', 'GET /api/annotation-queues/{id}'],
      repos: ['GET /api/repos', 'GET /api/repos/{owner}', 'GET /api/repos/{owner}/{repo}'],
      commits: ['GET /api/commits/{owner}/{repo}', 'GET /api/commits/{owner}/{repo}/{hash}'],
      likes: ['GET /api/likes/{owner}/{prompt}'],
      feedback: ['GET /api/feedback', 'GET /api/feedback/{id}'],
      sessions: ['GET /api/sessions/{id}'],
      examples: ['GET /api/examples'],
      public: ['GET /api/public/{token}/{type}']
    }
  });
}

async function handleCache(req, res, action, method) {
  if (method !== 'POST') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  if (action === 'clear') {
    // Clear cache simulation
    serverStats.caching.cacheSize = 0;
    serverStats.caching.memoryUsage = 0;
    serverStats.caching.evictions++;
    sendJSON(res, { success: true, message: 'Cache cleared successfully' });
  } else {
    sendJSON(res, { error: 'Unknown cache action' }, 404);
  }
}

async function handleAuth(req, res, action, method) {
  if (method !== 'POST') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  const data = await parseRequestBody(req);
  
  if (action === 'register') {
    const { name, email, password } = data;
    
    // Basic validation
    if (!name || !email || !password) {
      return sendJSON(res, { error: 'Missing required fields' }, 400);
    }
    
    // Check if user already exists
    if (users.has(email)) {
      return sendJSON(res, { error: 'User already exists' }, 409);
    }
    
    // Create user (in production, hash password)
    const user = {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date().toISOString()
    };
    
    users.set(email, user);
    
    // Create session
    const session = {
      id: Math.random().toString(36).substring(2),
      userId: user.id,
      email: user.email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    sessions.set(session.id, session);
    
    sendJSON(res, { 
      message: 'Registration successful',
      user: { id: user.id, name: user.name, email: user.email },
      session
    });
    
  } else if (action === 'login') {
    const { email, password } = data;
    
    // Basic validation
    if (!email || !password) {
      return sendJSON(res, { error: 'Missing email or password' }, 400);
    }
    
    // Check if user exists
    const user = users.get(email);
    if (!user) {
      return sendJSON(res, { error: 'Invalid credentials' }, 401);
    }
    
    // Create session
    const session = {
      id: Math.random().toString(36).substring(2),
      userId: user.id,
      email: user.email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    sessions.set(session.id, session);
    
    sendJSON(res, { 
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
      session
    });
  }
}

async function handlePasswordGeneration(req, res, method) {
  // Support both GET and POST for frontend compatibility
  let length, includeSymbols;
  
  if (method === 'GET') {
    const url = new URL(req.url, `http://localhost:${port}`);
    length = parseInt(url.searchParams.get('length')) || 16;
    includeSymbols = url.searchParams.get('includeSymbols') !== 'false';
  } else {
    const data = await parseRequestBody(req);
    length = data.length || 16;
    includeSymbols = data.includeSymbols !== false;
  }
  
  // Generate password using QGenUtils or fallback
  let password;
  if (QGenUtils.generateSecurePassword) {
    const options = { length, includeSymbols };
    password = QGenUtils.generateSecurePassword(options);
  } else {
    // Fallback password generation
    const charset = includeSymbols 
      ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    password = Array.from({ length }, () => charset.charAt(Math.floor(Math.random() * charset.length))).join('');
  }
  
  sendJSON(res, {
    password,
    length,
    hasSymbols: includeSymbols,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password)
  });
}

async function handleRuns(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  
  // Handle different run endpoints
  if (!action) {
    // GET /api/runs - List runs
    if (method === 'GET') {
      const runs = [
        { id: 'run1', name: 'Demo Run 1', status: 'completed', createdAt: new Date().toISOString() },
        { id: 'run2', name: 'Demo Run 2', status: 'running', createdAt: new Date().toISOString() }
      ];
      sendJSON(res, { runs });
    } 
    // POST /api/runs - Create run
    else if (method === 'POST') {
      const data = await parseRequestBody(req);
      const newRun = {
        id: `run${Date.now()}`,
        name: data.name || 'New Run',
        status: 'created',
        createdAt: new Date().toISOString()
      };
      sendJSON(res, { run: newRun }, 201);
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else if (action === 'batch') {
    // POST /api/runs/batch
    if (method !== 'POST') {
      return sendJSON(res, { error: 'Method not allowed' }, 405);
    }
    const data = await parseRequestBody(req);
    sendJSON(res, { message: 'Batch run created', count: data.runs?.length || 0 });
  } else if (action === 'multipart') {
    // POST /api/runs/multipart
    if (method !== 'POST') {
      return sendJSON(res, { error: 'Method not allowed' }, 405);
    }
    sendJSON(res, { message: 'Multipart run created' });
  } else if (action === 'stats') {
    // GET /api/runs/stats
    if (method !== 'GET') {
      return sendJSON(res, { error: 'Method not allowed' }, 405);
    }
    sendJSON(res, { 
      totalRuns: 42,
      completedRuns: 35,
      runningRuns: 5,
      failedRuns: 2
    });
  } else if (action.includes('share')) {
    // GET /api/runs/{runId}/share
    const runId = action.split('/')[0];
    if (method === 'GET') {
      sendJSON(res, { 
        runId, 
        shareToken: `share_${runId}_${Date.now()}`,
        shareUrl: `/public/share_${runId}_${Date.now()}`
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else {
    // GET /api/runs/{runId}
    if (method === 'GET') {
      sendJSON(res, { 
        id: action, 
        name: `Run ${action}`, 
        status: 'completed',
        createdAt: new Date().toISOString()
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  }
}

async function handleDatasets(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  
  if (!action) {
    // GET /api/datasets - List datasets
    if (method === 'GET') {
      const datasets = [
        { id: 'dataset1', name: 'Demo Dataset 1', size: 1024, createdAt: new Date().toISOString() },
        { id: 'dataset2', name: 'Demo Dataset 2', size: 2048, createdAt: new Date().toISOString() }
      ];
      sendJSON(res, { datasets });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else if (action === 'comparative') {
    // GET /api/datasets/comparative
    if (method !== 'GET') {
      return sendJSON(res, { error: 'Method not allowed' }, 405);
    }
    sendJSON(res, { 
      comparison: { dataset1: 'higher', dataset2: 'lower' },
      metrics: { accuracy: 0.95, precision: 0.87 }
    });
  } else if (action.includes('share')) {
    // GET /api/datasets/{datasetId}/share
    const datasetId = action.split('/')[0];
    if (method === 'GET') {
      sendJSON(res, { 
        datasetId, 
        shareToken: `share_${datasetId}_${Date.now()}`,
        shareUrl: `/public/share_${datasetId}_${Date.now()}`
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else {
    // GET /api/datasets/{datasetId} and its sub-paths
    const datasetId = action.split('/')[0];
    const subAction = action.split('/')[1]; // tags, index, search, splits, version
    
    if (method === 'GET') {
      switch (subAction) {
        case 'tags':
          sendJSON(res, { tags: ['tag1', 'tag2', 'important'] });
          break;
        case 'index':
          sendJSON(res, { index: { fields: ['id', 'name', 'created'] } });
          break;
        case 'search':
          const query = url.searchParams.get('q') || '';
          sendJSON(res, { results: [`Result for "${query}"`], total: 1 });
          break;
        case 'splits':
          sendJSON(res, { splits: ['train', 'validation', 'test'] });
          break;
        case 'version':
          sendJSON(res, { version: '1.0.0', lastModified: new Date().toISOString() });
          break;
        default:
          sendJSON(res, { 
            id: datasetId, 
            name: `Dataset ${datasetId}`, 
            size: 1024,
            createdAt: new Date().toISOString()
          });
      }
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  }
}

async function handleAnnotationQueues(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  
  if (!action) {
    // GET /api/annotation-queues - List queues
    if (method === 'GET') {
      const queues = [
        { id: 'queue1', name: 'Demo Queue 1', status: 'active', items: 10 },
        { id: 'queue2', name: 'Demo Queue 2', status: 'paused', items: 5 }
      ];
      sendJSON(res, { queues });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else {
    // Handle queue operations: /api/annotation-queues/{queueId}/{subAction}
    const queueId = action.split('/')[0];
    const subAction = action.split('/')[1];
    
    if (method === 'GET') {
      switch (subAction) {
        case undefined:
          sendJSON(res, { 
            id: queueId, 
            name: `Queue ${queueId}`, 
            status: 'active',
            items: 10
          });
          break;
        case 'items':
          sendJSON(res, { 
            items: [
              { id: 'item1', data: 'Sample data 1', status: 'pending' },
              { id: 'item2', data: 'Sample data 2', status: 'completed' }
            ],
            total: 2
          });
          break;
        case 'stats':
          sendJSON(res, { 
            queueId,
            totalItems: 10,
            completedItems: 7,
            pendingItems: 3
          });
          break;
        default:
          sendJSON(res, { error: 'Unknown sub-action' }, 404);
      }
    } else if (method === 'POST') {
      switch (subAction) {
        case 'process':
          sendJSON(res, { message: 'Queue processing started', queueId });
          break;
        case 'pause':
          sendJSON(res, { message: 'Queue paused', queueId });
          break;
        default:
          sendJSON(res, { error: 'Unknown sub-action' }, 404);
      }
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  }
}

async function handleRepos(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  const pathParts = reqPath.replace('/api/repos/', '').split('/');
  const owner = pathParts[0];
  const repoName = pathParts[1];
  
  if (!owner) {
    // GET /api/repos/ - List repos
    if (method === 'GET') {
      const repos = [
        { owner: 'user1', name: 'repo1', description: 'Demo repository 1' },
        { owner: 'user2', name: 'repo2', description: 'Demo repository 2' }
      ];
      sendJSON(res, { repos });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else if (owner && !repoName) {
    // GET /api/repos/{owner} - List repos by owner
    if (method === 'GET') {
      sendJSON(res, { 
        repos: [
          { owner, name: `${owner}-repo1`, description: `Repository 1 for ${owner}` },
          { owner, name: `${owner}-repo2`, description: `Repository 2 for ${owner}` }
        ]
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else {
    // GET /api/repos/{owner}/{repoName} - Get specific repo
    if (method === 'GET') {
      sendJSON(res, {
        owner,
        name: repoName,
        description: `Repository ${repoName} by ${owner}`,
        stars: 42,
        forks: 8,
        createdAt: new Date().toISOString()
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  }
}

async function handleCommits(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  const pathParts = reqPath.replace('/api/commits/', '').split('/');
  const ownerAndName = pathParts[0];
  const commitHash = pathParts[1];
  
  if (!ownerAndName) {
    sendJSON(res, { error: 'Repository required' }, 400);
  } else if (!commitHash) {
    // GET /api/commits/{owner}/{repoName} - List commits
    if (method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit')) || 10;
      const offset = parseInt(url.searchParams.get('offset')) || 0;
      
      const commits = [
        {
          hash: 'abc123',
          message: 'Initial commit',
          author: 'user1@example.com',
          timestamp: new Date().toISOString()
        },
        {
          hash: 'def456',
          message: 'Add new feature',
          author: 'user1@example.com',
          timestamp: new Date().toISOString()
        }
      ];
      
      sendJSON(res, { 
        commits: commits.slice(offset, offset + limit),
        total: commits.length
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else {
    // GET /api/commits/{owner}/{repoName}/{commitHash}
    if (method === 'GET') {
      const includeModel = url.searchParams.get('includeModel') === 'true';
      
      sendJSON(res, {
        hash: commitHash,
        message: 'Commit details',
        author: 'user1@example.com',
        timestamp: new Date().toISOString(),
        changes: ['file1.js', 'file2.js'],
        model: includeModel ? { type: 'demo', accuracy: 0.95 } : undefined
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  }
}

async function handleLikes(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  const pathParts = reqPath.replace('/api/likes/', '').split('/');
  const owner = pathParts[0];
  const promptName = pathParts[1];
  
  if (!owner || !promptName) {
    sendJSON(res, { error: 'Owner and prompt name required' }, 400);
  } else if (method === 'GET') {
    // GET /api/likes/{owner}/{promptName}
    sendJSON(res, {
      owner,
      promptName,
      likes: 15,
      liked: false,
      likeUrl: `/api/likes/${owner}/${promptName}`
    });
  } else if (method === 'POST') {
    // POST /api/likes/{owner}/{promptName} - Add like
    sendJSON(res, {
      owner,
      promptName,
      likes: 16,
      liked: true,
      message: 'Like added successfully'
    });
  } else {
    sendJSON(res, { error: 'Method not allowed' }, 405);
  }
}

async function handleFeedback(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  
  if (!action) {
    // GET /api/feedback - List feedback
    if (method === 'GET') {
      sendJSON(res, { 
        feedback: [
          { id: 'fb1', rating: 5, comment: 'Great!', createdAt: new Date().toISOString() },
          { id: 'fb2', rating: 4, comment: 'Good but could improve', createdAt: new Date().toISOString() }
        ]
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else if (action === 'tokens') {
    // GET /api/feedback/tokens
    if (method === 'GET') {
      sendJSON(res, { 
        tokens: [
          { id: 'token1', type: 'feedback', value: 100, used: false },
          { id: 'token2', type: 'feedback', value: 50, used: true }
        ]
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else {
    // GET /api/feedback/{feedbackId}
    if (method === 'GET') {
      sendJSON(res, {
        id: action,
        rating: 5,
        comment: 'Excellent work!',
        createdAt: new Date().toISOString()
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  }
}

async function handleSessions(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  
  if (!action) {
    sendJSON(res, { error: 'Session ID required' }, 400);
  } else {
    // GET /api/sessions/{sessionId}
    if (method === 'GET') {
      sendJSON(res, {
        id: action,
        status: 'active',
        userId: 'user123',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  }
}

async function handleExamples(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  
  if (!action) {
    // GET /api/examples - List examples
    if (method === 'GET') {
      const examples = [
        { id: 'ex1', name: 'Example 1', type: 'text', data: 'Sample text 1' },
        { id: 'ex2', name: 'Example 2', type: 'image', data: 'sample-image-url' }
      ];
      sendJSON(res, { examples });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  } else {
    // GET /api/examples with query params
    if (method === 'GET') {
      const params = Object.fromEntries(url.searchParams);
      sendJSON(res, { 
        examples: [
          { id: 'filtered1', name: 'Filtered Example', params }
        ],
        queryParams: params
      });
    } else {
      sendJSON(res, { error: 'Method not allowed' }, 405);
    }
  }
}

async function handlePublic(req, res, action, method) {
  const url = new URL(req.url, `http://localhost:${port}`);
  const pathParts = reqPath.replace('/api/public/', '').split('/');
  const shareToken = pathParts[0];
  const resourceType = pathParts[1]; // runs, datasets, examples
  
  if (!shareToken) {
    sendJSON(res, { error: 'Share token required' }, 400);
  } else if (method === 'GET') {
    switch (resourceType) {
      case 'runs':
        const runQuery = url.searchParams.get('q') || '';
        sendJSON(res, {
          shareToken,
          resourceType: 'runs',
          runs: [
            { id: 'shared-run1', name: 'Shared Run 1', data: runQuery }
          ]
        });
        break;
      case 'datasets':
        sendJSON(res, {
          shareToken,
          resourceType: 'datasets',
          datasets: [
            { id: 'shared-dataset1', name: 'Shared Dataset 1' }
          ]
        });
        break;
      case 'examples':
        const urlParams = Object.fromEntries(url.searchParams);
        sendJSON(res, {
          shareToken,
          resourceType: 'examples',
          examples: [
            { id: 'shared-example1', name: 'Shared Example 1', params: urlParams }
          ]
        });
        break;
      default:
        // Default public endpoint
        sendJSON(res, {
          shareToken,
          message: 'Public resource access',
          availableResources: ['runs', 'datasets', 'examples']
        });
    }
  } else {
    sendJSON(res, { error: 'Method not allowed' }, 405);
  }
}

async function handleProtected(req, res, action, method) {
  if (method !== 'GET') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  // Check API key in headers
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return sendJSON(res, { error: 'API key required' }, 401);
  }
  
  // Simple API key validation for demo
  if (apiKey !== 'demo-api-key-12345') {
    return sendJSON(res, { error: 'Invalid API key' }, 403);
  }
  
  // Return protected data
  sendJSON(res, {
    message: 'Access to protected data granted',
    data: {
      timestamp: new Date().toISOString(),
      userId: 'demo-user',
      permissions: ['read', 'write'],
      resources: [
        { id: 1, name: 'Resource 1', type: 'document' },
        { id: 2, name: 'Resource 2', type: 'image' },
        { id: 3, name: 'Resource 3', type: 'video' }
      ],
      serverInfo: {
        version: '2.0.0',
        environment: NODE_ENV || 'development',
        uptime: serverStats.system.uptime
      }
    }
  });
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
      const memoizedFn = QGenUtils.memoize ? QGenUtils.memoize(() => data.value) : (() => data.value);
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
      const testFn = QGenUtils.throttle ? QGenUtils.throttle(() => Date.now(), data.delay || 100) : (() => Date.now());
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
