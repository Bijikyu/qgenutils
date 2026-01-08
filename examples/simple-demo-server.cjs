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

const port = process.env.PORT || 3000;

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

  // Serve demo page
  if (pathname === '/' || pathname === '/demo') {
    serveDemoPage(res, startTime);
    return;
  }

  // Serve static files
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
      default:
        result = createErrorResponse(
          'Unknown endpoint category',
          'UNKNOWN_CATEGORY',
          { category, path }
        );
    }
    
    const statusCode =
      result && result.success === false ? getStatusCodeForErrorCode(result.error?.code) : 200;
    recordMetric('api', statusCode, Date.now() - startTime);

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
    default:
      return createErrorResponse(
        'Unknown validation action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['email', 'password'] }
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
    default:
      return createErrorResponse(
        'Unknown security action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['mask-api-key', 'sanitize-string'] }
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
    default:
      return createErrorResponse(
        'Unknown datetime action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['format'] }
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
    default:
      return createErrorResponse(
        'Unknown URL action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['ensure-protocol'] }
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
  console.log('\n🎯 Open http://localhost:3000 for interactive demo interface');
  console.log('📖 Test endpoints with curl or the interactive interface');
  console.log('\n✅ Simplified demo server ready for utility testing\n');
});
