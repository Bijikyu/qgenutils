/**
 * Simple Demo Server - Focused Utility Demonstration
 * 
 * Purpose: Lightweight demo server showcasing QGenUtils functionality
 * Replaces the overly complex 1244-line server with focused examples
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Since this is an ESM module, we'll use demo utilities directly
// Commenting out QGenUtils import for demo server simplicity

const port = process.env.PORT || 5000;

// Simple request logging
const logger = {
  info: (msg, meta = {}) => console.log(`ℹ️  ${msg}`, meta),
  warn: (msg, meta = {}) => console.log(`⚠️  ${msg}`, meta),
  error: (msg, meta = {}) => console.error(`❌ ${msg}`, meta)
};

const serverState = {
  startedAt: Date.now(),
  cache: new Map(),
  metrics: {
    totalRequests: 0,
    totalErrors: 0,
    totalResponseTimeMs: 0,
    byKind: {
      api: { requests: 0, errors: 0, totalResponseTimeMs: 0 },
      page: { requests: 0, errors: 0, totalResponseTimeMs: 0 },
      static: { requests: 0, errors: 0, totalResponseTimeMs: 0 }
    }
  }
};

function recordMetric(kind, statusCode, responseTimeMs) {
  const safeKind = kind in serverState.metrics.byKind ? kind : 'static';
  const isError = statusCode >= 400;

  serverState.metrics.totalRequests += 1;
  serverState.metrics.totalResponseTimeMs += responseTimeMs;
  if (isError) serverState.metrics.totalErrors += 1;

  const bucket = serverState.metrics.byKind[safeKind];
  bucket.requests += 1;
  bucket.totalResponseTimeMs += responseTimeMs;
  if (isError) bucket.errors += 1;
}

// Enhanced input validation utilities
const inputValidator = {
  validateString: (input, fieldName = 'input', options = {}) => {
    const {
      minLength = 0,
      maxLength = 10000,
      allowEmpty = false,
      trim = true
    } = options;
    
    // Handle null/undefined
    if (input === null || input === undefined) {
      return {
        isValid: allowEmpty,
        value: allowEmpty ? '' : null,
        error: allowEmpty ? null : `${fieldName} is required`
      };
    }
    
    // Convert to string
    const str = String(input);
    
    // Trim if requested
    const processedStr = trim ? str.trim() : str;
    
    // Check empty
    if (!allowEmpty && processedStr.length === 0) {
      return {
        isValid: false,
        value: processedStr,
        error: `${fieldName} cannot be empty`
      };
    }
    
    // Check length
    if (processedStr.length < minLength) {
      return {
        isValid: false,
        value: processedStr,
        error: `${fieldName} must be at least ${minLength} characters`
      };
    }
    
    if (processedStr.length > maxLength) {
      return {
        isValid: false,
        value: processedStr,
        error: `${fieldName} must not exceed ${maxLength} characters`
      };
    }
    
    return {
      isValid: true,
      value: processedStr,
      error: null
    };
  },
  
  validateNumber: (input, fieldName = 'number', options = {}) => {
    const {
      min = Number.NEGATIVE_INFINITY,
      max = Number.POSITIVE_INFINITY,
      allowFloat = true,
      allowNegative = true
    } = options;
    
    // Handle null/undefined
    if (input === null || input === undefined) {
      return {
        isValid: false,
        value: null,
        error: `${fieldName} is required`
      };
    }
    
    // Convert to number
    const num = Number(input);
    
    // Check if valid number
    if (isNaN(num) || !isFinite(num)) {
      return {
        isValid: false,
        value: input,
        error: `${fieldName} must be a valid number`
      };
    }
    
    // Check float
    if (!allowFloat && !Number.isInteger(num)) {
      return {
        isValid: false,
        value: num,
        error: `${fieldName} must be an integer`
      };
    }
    
    // Check negative
    if (!allowNegative && num < 0) {
      return {
        isValid: false,
        value: num,
        error: `${fieldName} cannot be negative`
      };
    }
    
    // Check range
    if (num < min) {
      return {
        isValid: false,
        value: num,
        error: `${fieldName} must be at least ${min}`
      };
    }
    
    if (num > max) {
      return {
        isValid: false,
        value: num,
        error: `${fieldName} must not exceed ${max}`
      };
    }
    
    return {
      isValid: true,
      value: num,
      error: null
    };
  }
};

// Demo utilities that mirror QGenUtils functionality
const demoUtils = {
  // Validation examples
  validateEmail: (email) => {
    // Enhanced input validation
    const emailValidation = inputValidator.validateString(email, 'email', {
      minLength: 3,
      maxLength: 254,
      allowEmpty: false,
      trim: true
    });
    
    if (!emailValidation.isValid) {
      return {
        error: emailValidation.error,
        isValid: false,
        message: emailValidation.error,
        input: email
      };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(emailValidation.value);
    
    return {
      isValid,
      message: isValid ? 'Valid email format' : 'Invalid email format',
      input: emailValidation.value
    };
  },

  validatePassword: (password) => {
    // Enhanced input validation
    const passwordValidation = inputValidator.validateString(password, 'password', {
      minLength: 8,
      maxLength: 128,
      allowEmpty: false,
      trim: false
    });
    
    if (!passwordValidation.isValid) {
      return {
        error: passwordValidation.error,
        strength: 0,
        score: 0,
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          numbers: false,
          special: false
        },
        isValid: false,
        message: passwordValidation.error
      };
    }
    
    const pwd = passwordValidation.value;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    return {
      strength,
      score: strength / Object.keys(checks).length,
      checks,
      isValid: strength >= 4,
      message: strength >= 4 ? 'Strong password' : 'Weak password'
    };
  },

  // Security examples
  maskApiKey: (apiKey) => {
    // Enhanced input validation
    const apiKeyValidation = inputValidator.validateString(apiKey, 'apiKey', {
      minLength: 8,
      maxLength: 500,
      allowEmpty: false,
      trim: true
    });
    
    if (!apiKeyValidation.isValid) {
      return { 
        original: apiKey, 
        masked: '****', 
        error: apiKeyValidation.error 
      };
    }
    
    const key = apiKeyValidation.value;
    
    if (key.length <= 8) {
      return { original: key, masked: '****' };
    }
    
    const masked = key.substring(0, 4) + '****' + key.substring(key.length - 4);
    return { original: key, masked };
  },

  sanitizeString: (input) => {
    // Enhanced input validation
    const inputValidation = inputValidator.validateString(input, 'input', {
      minLength: 0,
      maxLength: 100000,
      allowEmpty: true,
      trim: false
    });
    
    if (!inputValidation.isValid) {
      return {
        original: input,
        sanitized: '',
        changed: true,
        error: inputValidation.error
      };
    }
    
    const str = inputValidation.value;
    
    const sanitized = str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    return {
      original: str,
      sanitized,
      changed: str.length !== sanitized.length
    };
  },

  // DateTime examples
  formatDateTime: (dateString, format = 'default') => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return { error: 'Invalid date', input: dateString };
      }
      
      const formats = {
        default: date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        iso: date.toISOString()
      };
      
      return {
        original: dateString,
        formatted: formats[format] || formats.default,
        timestamp: date.getTime()
      };
    } catch (error) {
      return { error: error.message, input: dateString };
    }
  },

  // URL examples
  ensureProtocol: (url, protocol = 'https') => {
    if (typeof url !== 'string') {
      url = String(url || '');
    }
    
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
    
    if (hasProtocol) {
      return {
        original: url,
        processed: url,
        added: false
      };
    }
    
    const processed = `${protocol}://${url.replace(/^\/+/, '')}`;
    return {
      original: url,
      processed,
      added: true,
      protocol
    };
  },

  // File examples
  formatFileSize: (bytes) => {
    // Enhanced input validation
    const bytesValidation = inputValidator.validateNumber(bytes, 'bytes', {
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      allowFloat: false,
      allowNegative: false
    });
    
    if (!bytesValidation.isValid) {
      return { 
        error: bytesValidation.error, 
        formatted: '0 B',
        bytes: bytes
      };
    }
    
    const numBytes = bytesValidation.value;
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = numBytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    const formatted = `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
    
    return {
      bytes: numBytes,
      formatted,
      unit: units[unitIndex],
      size
    };
  },

  // Performance examples
  memoize: (func) => {
    const cache = new Map();
    
    return function(...args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return {
          result: cache.get(key),
          fromCache: true,
          cacheHits: cache.size + 1
        };
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      
      return {
        result,
        fromCache: false,
        cacheHits: cache.size
      };
    };
  },

  // Additional validation functions
  validateUrl: (url) => {
    if (!url || typeof url !== 'string') {
      return { isValid: false, message: 'URL is required', input: url };
    }
    try {
      const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
      return { isValid: true, message: 'Valid URL', input: url, parsed: { protocol: urlObj.protocol, host: urlObj.host, pathname: urlObj.pathname } };
    } catch (e) {
      return { isValid: false, message: 'Invalid URL format', input: url };
    }
  },

  validateNumber: (value, options = {}) => {
    const { min, max, allowFloat = true } = options;
    const num = Number(value);
    if (isNaN(num)) return { isValid: false, message: 'Not a valid number', input: value };
    if (!allowFloat && !Number.isInteger(num)) return { isValid: false, message: 'Must be an integer', input: value };
    if (min !== undefined && num < min) return { isValid: false, message: `Must be at least ${min}`, input: value };
    if (max !== undefined && num > max) return { isValid: false, message: `Must be at most ${max}`, input: value };
    return { isValid: true, message: 'Valid number', input: value, parsed: num };
  },

  validateArray: (arr) => {
    const isValid = Array.isArray(arr);
    return { isValid, message: isValid ? 'Valid array' : 'Not an array', input: arr, length: isValid ? arr.length : 0 };
  },

  validateObject: (obj) => {
    const isValid = obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    return { isValid, message: isValid ? 'Valid object' : 'Not an object', input: obj, keys: isValid ? Object.keys(obj) : [] };
  },

  isNullOrUndefined: (value) => {
    const result = value === null || value === undefined;
    return { result, input: value, type: value === null ? 'null' : value === undefined ? 'undefined' : typeof value };
  },

  isNullOrEmpty: (value) => {
    const result = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
    return { result, input: value, reason: value === null ? 'null' : value === undefined ? 'undefined' : value === '' ? 'empty string' : Array.isArray(value) && value.length === 0 ? 'empty array' : 'has value' };
  },

  // Additional URL functions
  normalizeUrlOrigin: (url) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
      return { original: url, normalized: urlObj.origin, protocol: urlObj.protocol, host: urlObj.host };
    } catch (e) {
      return { error: 'Invalid URL', input: url };
    }
  },

  stripProtocol: (url) => {
    if (!url) return { error: 'URL is required', input: url };
    const stripped = String(url).replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
    return { original: url, stripped, hadProtocol: stripped !== url };
  },

  parseUrlParts: (url) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
      return { original: url, parts: { protocol: urlObj.protocol, host: urlObj.host, hostname: urlObj.hostname, port: urlObj.port, pathname: urlObj.pathname, search: urlObj.search, hash: urlObj.hash } };
    } catch (e) {
      return { error: 'Invalid URL', input: url };
    }
  },

  // Additional DateTime functions
  formatDuration: (ms) => {
    if (typeof ms !== 'number' || isNaN(ms)) return { error: 'Invalid duration', input: ms };
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return { ms, formatted: days > 0 ? `${days}d ${hours % 24}h ${minutes % 60}m` : hours > 0 ? `${hours}h ${minutes % 60}m ${seconds % 60}s` : minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`, parts: { days, hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 } };
  },

  addDays: (dateString, days) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { error: 'Invalid date', input: dateString };
      date.setDate(date.getDate() + Number(days));
      return { original: dateString, daysAdded: Number(days), result: date.toISOString(), formatted: date.toLocaleDateString() };
    } catch (e) {
      return { error: e.message, input: dateString };
    }
  },

  formatDate: (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { error: 'Invalid date', input: dateString };
      return { original: dateString, formatted: date.toLocaleDateString(), iso: date.toISOString().split('T')[0] };
    } catch (e) {
      return { error: e.message, input: dateString };
    }
  },

  formatDateWithPrefix: (dateString, prefix = '') => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { error: 'Invalid date', input: dateString };
      return { original: dateString, prefix, formatted: `${prefix}${date.toLocaleDateString()}` };
    } catch (e) {
      return { error: e.message, input: dateString };
    }
  },

  // Password/Security functions
  generateSecurePassword: (length = 16, options = {}) => {
    const { includeSymbols = true, includeNumbers = true, includeUppercase = true, includeLowercase = true } = options;
    let chars = '';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return { password, length: password.length, options: { includeSymbols, includeNumbers, includeUppercase, includeLowercase } };
  },

  hashPassword: (password) => {
    const crypto = require('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash: hash.substring(0, 32) + '...', salt: salt.substring(0, 8) + '...', algorithm: 'PBKDF2-SHA512', iterations: 10000, note: 'Hash truncated for display' };
  },

  verifyPassword: (password, providedHash) => {
    return { message: 'Password verification demo - in production, compare with stored hash', passwordLength: password?.length || 0, hashProvided: !!providedHash, wouldVerify: password?.length >= 8 };
  },

  // ID Generation
  generateExecutionId: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    const id = `exec_${timestamp}_${random}`;
    return { id, timestamp: Date.now(), components: { timestampPart: timestamp, randomPart: random } };
  },

  // Scheduling
  msToCron: (ms) => {
    if (typeof ms !== 'number' || ms < 1000) return { error: 'Invalid interval (min 1000ms)', input: ms };
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return { ms, cron: `*/${seconds} * * * * *`, description: `Every ${seconds} seconds`, note: 'Second-level cron (non-standard)' };
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return { ms, cron: `*/${minutes} * * * *`, description: `Every ${minutes} minutes` };
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return { ms, cron: `0 */${hours} * * *`, description: `Every ${hours} hours` };
    const days = Math.floor(hours / 24);
    return { ms, cron: `0 0 */${days} * *`, description: `Every ${days} days` };
  },

  // MinHeap demo
  minHeapDemo: (numbers) => {
    if (!Array.isArray(numbers)) return { error: 'Input must be an array of numbers' };
    const nums = numbers.map(Number).filter(n => !isNaN(n));
    const sorted = [...nums].sort((a, b) => a - b);
    return { input: nums, heapOperations: { insert: nums, extractMin: sorted, peek: sorted[0] || null }, sorted, size: nums.length, description: 'MinHeap always returns smallest element first' };
  },

  // Rate Limiter demo
  rateLimiterDemo: (requests, windowMs = 60000, maxRequests = 10) => {
    const current = Number(requests) || 0;
    const remaining = Math.max(0, maxRequests - current);
    const isLimited = current >= maxRequests;
    return { currentRequests: current, maxRequests, windowMs, remaining, isLimited, message: isLimited ? 'Rate limit exceeded' : `${remaining} requests remaining` };
  },

  // API Key Validator demo
  apiKeyValidatorDemo: (apiKey, validKeys = ['demo-key-123', 'test-key-456']) => {
    if (!apiKey) return { isValid: false, message: 'API key is required' };
    const isValid = validKeys.includes(apiKey);
    return { isValid, message: isValid ? 'Valid API key' : 'Invalid API key', keyProvided: apiKey.substring(0, 4) + '****' };
  }
};

// Simple HTTP server
const server = http.createServer((req, res) => {
  const startTime = Date.now();
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = require('url').parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API routes
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname, startTime);
    return;
  }

  // Serve static files (demo.html is the default for root)
  serveStaticFile(req, res, pathname, startTime);
});

// Standardized error response format
function createErrorResponse(message, code = 'UNKNOWN_ERROR', details = null) {
  const response = {
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString()
    }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  return response;
}

// Standardized success response format
function createSuccessResponse(data, meta = null) {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (meta) {
    response.meta = meta;
  }
  
  return response;
}

async function handleApiRequest(req, res, path, startTime) {
  const pathParts = path.split('/');
  const category = pathParts[2] || '';
  const action = pathParts[3] || '';

  const isStats = category === 'stats' && !action;
  const isCacheClear = category === 'cache' && action === 'clear';

  if (req.method !== 'POST' && !(req.method === 'GET' && isStats)) {
    const errorResponse = createErrorResponse(
      'Method not allowed',
      'METHOD_NOT_ALLOWED',
      { allowedMethods: isStats ? ['GET'] : ['POST'] }
    );
    recordMetric('api', 405, Date.now() - startTime);
    sendJson(res, errorResponse, 405);
    return;
  }

  try {
    const body = req.method === 'POST' ? await parseRequestBody(req) : {};
    
    let result;
    switch (category) {
      case 'validate':
        result = handleValidation(action, body);
        break;
      case 'security':
        result = handleSecurity(action, body);
        break;
      case 'datetime':
        result = handleDateTime(action, body);
        break;
      case 'url':
        result = handleUrl(action, body);
        break;
      case 'file':
        result = handleFile(action, body);
        break;
      case 'performance':
        result = handlePerformance(action, body);
        break;
      case 'stats':
        result = handleStats();
        break;
      case 'cache':
        result = handleCache(action);
        break;
      case 'scheduling':
        result = handleScheduling(action, body);
        break;
      case 'id':
        result = handleIdGeneration(action, body);
        break;
      case 'data-structures':
        result = handleDataStructures(action, body);
        break;
      default:
        result = createErrorResponse(
          'Unknown endpoint category',
          'UNKNOWN_CATEGORY',
          { category, path }
        );
    }
    
    const statusCode =
      result && result.success === false ? getStatusCodeForErrorCode(result.error?.code) : 200;
    if (!isStats) recordMetric('api', statusCode, Date.now() - startTime);

    // Check if result is already a formatted response
    if (result && typeof result === 'object' && (result.success !== undefined || result.error)) {
      sendJson(res, result, statusCode);
    } else {
      // Wrap legacy responses in standardized format
      const successResponse = createSuccessResponse(result);
      sendJson(res, successResponse);
    }
    
    logger.info('API Request', { path, action, responseTime: Date.now() - startTime });
    
  } catch (error) {
    logger.error('API Request Error', { path, error: error.message, stack: error.stack });
    if (error && error.code === 'PAYLOAD_TOO_LARGE') {
      const errorResponse = createErrorResponse('Request body too large', 'PAYLOAD_TOO_LARGE');
      recordMetric('api', 413, Date.now() - startTime);
      sendJson(res, errorResponse, 413);
      return;
    }
    const errorResponse = createErrorResponse('Request processing failed', 'PROCESSING_ERROR', {
      path,
      error: error?.message
    });
    recordMetric('api', 500, Date.now() - startTime);
    sendJson(res, errorResponse, 500);
  }
}

function getStatusCodeForErrorCode(code) {
  switch (code) {
    case 'METHOD_NOT_ALLOWED':
      return 405;
    case 'UNKNOWN_CATEGORY':
    case 'UNKNOWN_ACTION':
      return 404;
    case 'VALIDATION_ERROR':
    case 'SECURITY_ERROR':
    case 'DATETIME_ERROR':
    case 'URL_ERROR':
    case 'FILE_ERROR':
    case 'PERFORMANCE_ERROR':
      return 400;
    case 'PAYLOAD_TOO_LARGE':
      return 413;
    default:
      return 400;
  }
}

function handleStats() {
  const total = serverState.metrics.totalRequests;
  const avgResponseTime =
    total > 0 ? serverState.metrics.totalResponseTimeMs / total : 0;
  const errorRate = total > 0 ? (serverState.metrics.totalErrors / total) * 100 : 0;

  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  return createSuccessResponse({
    requestCount: serverState.metrics.byKind.api.requests,
    avgResponseTimeMs: Number(avgResponseTime.toFixed(2)),
    errorRatePercent: Number(errorRate.toFixed(2)),
    // Back-compat for existing dashboard fields
    avgResponseTime: Number(avgResponseTime.toFixed(2)),
    errorRate: Number(errorRate.toFixed(2)),
    rateLimiting: {
      activeClients: 0,
      blockedRequests: 0,
      rateLimitedRequests: 0,
      quotaEntries: 0
    },
    caching: {
      hitRate: 0,
      cacheSize: serverState.cache.size,
      memoryUsage: Math.round(mem.heapUsed / 1024),
      evictions: 0
    },
    system: {
      uptime: uptimeSeconds,
      memory: { rss: mem.rss, heapUsed: mem.heapUsed },
      platform: `${process.platform} ${process.arch}`
    }
  });
}

function handleCache(action) {
  switch (action) {
    case 'clear': {
      const cleared = serverState.cache.size;
      serverState.cache.clear();
      return createSuccessResponse({ cleared });
    }
    default:
      return createErrorResponse('Unknown cache action', 'UNKNOWN_ACTION', {
        action,
        availableActions: ['clear']
      });
  }
}

function handleValidation(action, body) {
  switch (action) {
    case 'email':
      const emailResult = demoUtils.validateEmail(body.email);
      return emailResult.error ? 
        createErrorResponse(emailResult.message, 'VALIDATION_ERROR', { input: body.email }) :
        createSuccessResponse(emailResult);
    case 'password':
      const passwordResult = demoUtils.validatePassword(body.password);
      return passwordResult.error ? 
        createErrorResponse(passwordResult.message, 'VALIDATION_ERROR', { input: '***' }) :
        createSuccessResponse(passwordResult);
    case 'url':
      return createSuccessResponse(demoUtils.validateUrl(body.url));
    case 'number':
      return createSuccessResponse(demoUtils.validateNumber(body.value, body.options || {}));
    case 'array':
      return createSuccessResponse(demoUtils.validateArray(body.value));
    case 'object':
      return createSuccessResponse(demoUtils.validateObject(body.value));
    case 'null-or-undefined':
      return createSuccessResponse(demoUtils.isNullOrUndefined(body.value));
    case 'null-or-empty':
      return createSuccessResponse(demoUtils.isNullOrEmpty(body.value));
    default:
      return createErrorResponse(
        'Unknown validation action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['email', 'password', 'url', 'number', 'array', 'object', 'null-or-undefined', 'null-or-empty'] }
      );
  }
}

function handleSecurity(action, body) {
  switch (action) {
    case 'mask-api-key':
      const maskResult = demoUtils.maskApiKey(body.apiKey);
      return maskResult.error ? 
        createErrorResponse(maskResult.error, 'SECURITY_ERROR', { input: '***' }) :
        createSuccessResponse(maskResult);
    case 'sanitize-string':
      const sanitizeResult = demoUtils.sanitizeString(body.input);
      return sanitizeResult.error ? 
        createErrorResponse(sanitizeResult.error, 'SECURITY_ERROR', { input: body.input }) :
        createSuccessResponse(sanitizeResult);
    case 'generate-password':
      return createSuccessResponse(demoUtils.generateSecurePassword(body.length || 16, body.options || {}));
    case 'hash-password':
      if (!body.password) return createErrorResponse('Password is required', 'SECURITY_ERROR');
      return createSuccessResponse(demoUtils.hashPassword(body.password));
    case 'verify-password':
      return createSuccessResponse(demoUtils.verifyPassword(body.password, body.hash));
    case 'validate-api-key':
      return createSuccessResponse(demoUtils.apiKeyValidatorDemo(body.apiKey, body.validKeys));
    case 'rate-limiter':
      return createSuccessResponse(demoUtils.rateLimiterDemo(body.requests, body.windowMs, body.maxRequests));
    default:
      return createErrorResponse(
        'Unknown security action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['mask-api-key', 'sanitize-string', 'generate-password', 'hash-password', 'verify-password', 'validate-api-key', 'rate-limiter'] }
      );
  }
}

function handleDateTime(action, body) {
  switch (action) {
    case 'format':
      const dateTimeResult = demoUtils.formatDateTime(body.date, body.format);
      return dateTimeResult.error ? 
        createErrorResponse(dateTimeResult.error, 'DATETIME_ERROR', { input: body.date }) :
        createSuccessResponse(dateTimeResult);
    case 'format-duration':
      const durationResult = demoUtils.formatDuration(body.ms);
      return durationResult.error ? 
        createErrorResponse(durationResult.error, 'DATETIME_ERROR', { input: body.ms }) :
        createSuccessResponse(durationResult);
    case 'add-days':
      const addDaysResult = demoUtils.addDays(body.date, body.days);
      return addDaysResult.error ? 
        createErrorResponse(addDaysResult.error, 'DATETIME_ERROR', { input: body.date }) :
        createSuccessResponse(addDaysResult);
    case 'format-date':
      const formatDateResult = demoUtils.formatDate(body.date);
      return formatDateResult.error ? 
        createErrorResponse(formatDateResult.error, 'DATETIME_ERROR', { input: body.date }) :
        createSuccessResponse(formatDateResult);
    case 'format-date-with-prefix':
      const prefixResult = demoUtils.formatDateWithPrefix(body.date, body.prefix);
      return prefixResult.error ? 
        createErrorResponse(prefixResult.error, 'DATETIME_ERROR', { input: body.date }) :
        createSuccessResponse(prefixResult);
    default:
      return createErrorResponse(
        'Unknown datetime action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['format', 'format-duration', 'add-days', 'format-date', 'format-date-with-prefix'] }
      );
  }
}

function handleUrl(action, body) {
  switch (action) {
    case 'ensure-protocol':
      const urlResult = demoUtils.ensureProtocol(body.url, body.protocol);
      return urlResult.error ? 
        createErrorResponse(urlResult.error, 'URL_ERROR', { input: body.url }) :
        createSuccessResponse(urlResult);
    case 'normalize-origin':
      const normalizeResult = demoUtils.normalizeUrlOrigin(body.url);
      return normalizeResult.error ? 
        createErrorResponse(normalizeResult.error, 'URL_ERROR', { input: body.url }) :
        createSuccessResponse(normalizeResult);
    case 'strip-protocol':
      const stripResult = demoUtils.stripProtocol(body.url);
      return stripResult.error ? 
        createErrorResponse(stripResult.error, 'URL_ERROR', { input: body.url }) :
        createSuccessResponse(stripResult);
    case 'parse-parts':
      const parseResult = demoUtils.parseUrlParts(body.url);
      return parseResult.error ? 
        createErrorResponse(parseResult.error, 'URL_ERROR', { input: body.url }) :
        createSuccessResponse(parseResult);
    default:
      return createErrorResponse(
        'Unknown URL action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['ensure-protocol', 'normalize-origin', 'strip-protocol', 'parse-parts'] }
      );
  }
}

function handleFile(action, body) {
  switch (action) {
    case 'format-size':
      const fileResult = demoUtils.formatFileSize(body.bytes);
      return fileResult.error ? 
        createErrorResponse(fileResult.error, 'FILE_ERROR', { input: body.bytes }) :
        createSuccessResponse(fileResult);
    default:
      return createErrorResponse(
        'Unknown file action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['format-size'] }
      );
  }
}

function handlePerformance(action, body) {
  switch (action) {
    case 'memoize':
      try {
        const demoValidation = inputValidator.validateString(body.demo, 'demo', {
          minLength: 1,
          maxLength: 50,
          allowEmpty: false,
          trim: true
        });
        const demo = demoValidation.isValid ? demoValidation.value : 'add';

        const allowedDemos = new Set(['add', 'uppercase', 'filesize']);
        if (!allowedDemos.has(demo)) {
          return createErrorResponse('Unknown performance demo', 'PERFORMANCE_ERROR', {
            demo,
            availableDemos: Array.from(allowedDemos)
          });
        }

        const args = Array.isArray(body.args) ? body.args.slice(0, 5) : undefined;

        let fn;
        let defaultArgs;
        if (demo === 'add') {
          fn = (a, b) => Number(a) + Number(b);
          defaultArgs = [40, 2];
        } else if (demo === 'uppercase') {
          fn = (s) => String(s).toUpperCase();
          defaultArgs = ['hello'];
        } else {
          fn = (bytes) => demoUtils.formatFileSize(bytes).formatted;
          defaultArgs = [1048576];
        }

        const memoized = demoUtils.memoize(fn);
        const results = [];
        const callArgs = args && args.length > 0 ? args : defaultArgs;

        for (let i = 0; i < 3; i++) {
          results.push(memoized(...callArgs));
        }

        const performanceResult = {
          demo,
          args: callArgs,
          runs: results,
          explanation: 'First call computes, subsequent calls return cached result'
        };
        return createSuccessResponse(performanceResult);
      } catch (error) {
        return createErrorResponse('Failed to execute memoization demo', 'PERFORMANCE_ERROR', {
          error: error.message
        });
      }
    default:
      return createErrorResponse(
        'Unknown performance action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['memoize'] }
      );
  }
}

function handleScheduling(action, body) {
  switch (action) {
    case 'ms-to-cron':
      const cronResult = demoUtils.msToCron(body.ms);
      return cronResult.error ? 
        createErrorResponse(cronResult.error, 'SCHEDULING_ERROR', { input: body.ms }) :
        createSuccessResponse(cronResult);
    default:
      return createErrorResponse(
        'Unknown scheduling action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['ms-to-cron'] }
      );
  }
}

function handleIdGeneration(action, body) {
  switch (action) {
    case 'execution-id':
      return createSuccessResponse(demoUtils.generateExecutionId());
    default:
      return createErrorResponse(
        'Unknown ID generation action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['execution-id'] }
      );
  }
}

function handleDataStructures(action, body) {
  switch (action) {
    case 'min-heap':
      const heapResult = demoUtils.minHeapDemo(body.numbers || [5, 3, 8, 1, 9, 2]);
      return heapResult.error ? 
        createErrorResponse(heapResult.error, 'DATA_STRUCTURE_ERROR') :
        createSuccessResponse(heapResult);
    default:
      return createErrorResponse(
        'Unknown data structure action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['min-heap'] }
      );
  }
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const maxBytes = 1_000_000;
    const chunks = [];
    let totalBytes = 0;
    req.on('data', chunk => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        const err = new Error('Request body too large');
        err.code = 'PAYLOAD_TOO_LARGE';
        reject(err);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', reject);
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
        if (!body) {
          resolve({});
          return;
        }
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, data, statusCode = 200) {
  let jsonData;
  try {
    jsonData = JSON.stringify(data, null, 2);
  } catch (error) {
    // Handle circular references and other JSON.stringify errors
    jsonData = JSON.stringify({ 
      success: false, 
      error: 'Response serialization failed',
      timestamp: new Date().toISOString()
    }, null, 2);
    statusCode = 500;
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(jsonData);
}

function serveDemoPage(res, startTime) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>QGenUtils Demo Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .section h2 { color: #555; margin-top: 0; }
        .endpoint { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 3px; }
        .method { color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-weight: bold; background: #28a745; }
        .examples { margin-top: 30px; }
        .example { margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 5px; }
        pre { background: #f8f8f8; padding: 10px; border-radius: 3px; overflow-x: auto; }
        button { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .result { margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 3px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 QGenUtils Demo Server</h1>
        
        <div class="section">
            <h2>📧 Validation</h2>
            <div class="endpoint">
                <span class="method">POST</span> /api/validate/email
                <button onclick="testEmail()">Test</button>
                <div id="email-result" class="result"></div>
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/validate/password
                <button onclick="testPassword()">Test</button>
                <div id="password-result" class="result"></div>
            </div>
        </div>

        <div class="section">
            <h2>🔒 Security</h2>
            <div class="endpoint">
                <span class="method">POST</span> /api/security/mask-api-key
                <button onclick="testMaskApiKey()">Test</button>
                <div id="mask-result" class="result"></div>
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/security/sanitize-string
                <button onclick="testSanitize()">Test</button>
                <div id="sanitize-result" class="result"></div>
            </div>
        </div>

        <div class="section">
            <h2>📅 DateTime</h2>
            <div class="endpoint">
                <span class="method">POST</span> /api/datetime/format
                <button onclick="testDateTime()">Test</button>
                <div id="datetime-result" class="result"></div>
            </div>
        </div>

        <div class="section">
            <h2>🌐 URL Processing</h2>
            <div class="endpoint">
                <span class="method">POST</span> /api/url/ensure-protocol
                <button onclick="testUrl()">Test</button>
                <div id="url-result" class="result"></div>
            </div>
        </div>

        <div class="section">
            <h2>📄 File Utilities</h2>
            <div class="endpoint">
                <span class="method">POST</span> /api/file/format-size
                <button onclick="testFileSize()">Test</button>
                <div id="filesize-result" class="result"></div>
            </div>
        </div>

        <div class="section">
            <h2>⚡ Performance</h2>
            <div class="endpoint">
                <span class="method">POST</span> /api/performance/memoize
                <button onclick="testMemoize()">Test</button>
                <div id="memoize-result" class="result"></div>
            </div>
        </div>

        <div class="examples">
            <h2>🧪 Test with curl</h2>
            <div class="example">
                <h3>Email Validation</h3>
                <pre>curl -X POST http://localhost:3000/api/validate/email \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com"}'</pre>
            </div>
            <div class="example">
                <h3>API Key Masking</h3>
                <pre>curl -X POST http://localhost:3000/api/security/mask-api-key \\
  -H "Content-Type: application/json" \\
  -d '{"apiKey": "sk-1234567890abcdef1234567890abcdef"}'</pre>
            </div>
        </div>
    </div>

    <script>
        async function testEmail() {
            const response = await fetch('/api/validate/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com' })
            });
            const result = await response.json();
            document.getElementById('email-result').textContent = JSON.stringify(result, null, 2);
        }

        async function testPassword() {
            const response = await fetch('/api/validate/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: 'MySecurePass123!' })
            });
            const result = await response.json();
            document.getElementById('password-result').textContent = JSON.stringify(result, null, 2);
        }

        async function testMaskApiKey() {
            const response = await fetch('/api/security/mask-api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: 'sk-1234567890abcdef1234567890abcdef' })
            });
            const result = await response.json();
            document.getElementById('mask-result').textContent = JSON.stringify(result, null, 2);
        }

        async function testSanitize() {
            const response = await fetch('/api/security/sanitize-string', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: '<script>alert("xss")</script>Hello World' })
            });
            const result = await response.json();
            document.getElementById('sanitize-result').textContent = JSON.stringify(result, null, 2);
        }

        async function testDateTime() {
            const response = await fetch('/api/datetime/format', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: new Date().toISOString(), format: 'default' })
            });
            const result = await response.json();
            document.getElementById('datetime-result').textContent = JSON.stringify(result, null, 2);
        }

        async function testUrl() {
            const response = await fetch('/api/url/ensure-protocol', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: 'example.com', protocol: 'https' })
            });
            const result = await response.json();
            document.getElementById('url-result').textContent = JSON.stringify(result, null, 2);
        }

        async function testFileSize() {
            const response = await fetch('/api/file/format-size', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bytes: 1048576 })
            });
            const result = await response.json();
            document.getElementById('filesize-result').textContent = JSON.stringify(result, null, 2);
        }

        async function testMemoize() {
            const response = await fetch('/api/performance/memoize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ demo: 'add', args: [40, 2] })
            });
            const result = await response.json();
            document.getElementById('memoize-result').textContent = JSON.stringify(result, null, 2);
        }
    </script>
</body>
</html>`;
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
  recordMetric('page', 200, Date.now() - startTime);
  logger.info('Demo page served', { responseTime: Date.now() - startTime });
}

function serveStaticFile(req, res, pathname, startTime) {
  const baseDir = __dirname;
  const requested = pathname === '/' ? '/demo.html' : pathname;

  let normalized;
  try {
    normalized = path.normalize(decodeURIComponent(requested));
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  const relative = normalized.replace(/^\/+/, '');
  const filePath = path.join(baseDir, relative);
  const relativePath = path.relative(baseDir, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  const extname = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  }[extname] || 'text/plain';

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
    }
    res.end('File Not Found');
    recordMetric('static', 404, Date.now() - startTime);
  });
  stream.on('open', () => {
    if (!res.headersSent) {
      res.writeHead(200, { 'Content-Type': contentType });
    }
    stream.pipe(res);
    recordMetric('static', 200, Date.now() - startTime);
    logger.info('Static file served', { file: filePath, responseTime: Date.now() - startTime });
  });
}

// Start server
server.listen(port, () => {
  console.log(`\n🚀 QGenUtils Demo Server listening on http://localhost:${port}\n`);
  console.log('📋 Available API Endpoints:');
  console.log('  📧 Validation:');
  console.log('    POST /api/validate/email - Email validation');
  console.log('    POST /api/validate/password - Password validation');
  console.log('  🔒 Security:');
  console.log('    POST /api/security/mask-api-key - API key masking');
  console.log('    POST /api/security/sanitize-string - String sanitization');
  console.log('  📅 DateTime:');
  console.log('    POST /api/datetime/format - Date formatting');
  console.log('  🌐 URL Processing:');
  console.log('    POST /api/url/ensure-protocol - Protocol normalization');
  console.log('  📄 File Utilities:');
  console.log('    POST /api/file/format-size - File size formatting');
  console.log('  ⚡ Performance:');
  console.log('    POST /api/performance/memoize - Function memoization demo');
  console.log('\n🎯 Open http://localhost:5000 for interactive demo interface');
  console.log('📖 Test endpoints with curl or the interactive interface');
  console.log('\n✅ Simplified demo server ready for utility testing\n');
});
