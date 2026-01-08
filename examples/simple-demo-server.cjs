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
  const path = parsedUrl.pathname;

  // API routes
  if (path.startsWith('/api/')) {
    handleApiRequest(req, res, path, startTime);
    return;
  }

  // Serve demo page
  if (path === '/' || path === '/demo') {
    serveDemoPage(res, startTime);
    return;
  }

  // Serve static files
  serveStaticFile(req, res, path, startTime);
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
  if (req.method !== 'POST') {
    const errorResponse = createErrorResponse(
      'Method not allowed',
      'METHOD_NOT_ALLOWED',
      { allowedMethods: ['POST'] }
    );
    sendJson(res, errorResponse, 405);
    return;
  }

  try {
    const body = await parseRequestBody(req);
    const pathParts = path.split('/');
    const category = pathParts[2] || '';
    const action = pathParts[3] || '';
    
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
      case 'string':
        result = handleString(action, body);
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
      default:
        result = createErrorResponse(
          'Unknown endpoint category',
          'UNKNOWN_CATEGORY',
          { category, path }
        );
    }
    
    // Check if result is already a formatted response
    if (result && typeof result === 'object' && (result.success !== undefined || result.error)) {
      sendJson(res, result);
    } else {
      // Wrap legacy responses in standardized format
      const successResponse = createSuccessResponse(result);
      sendJson(res, successResponse);
    }
    
    logger.info('API Request', { path, action, responseTime: Date.now() - startTime });
    
  } catch (error) {
    logger.error('API Request Error', { path, error: error.message, stack: error.stack });
    const errorResponse = createErrorResponse(
      'Request processing failed',
      'PROCESSING_ERROR',
      { path, error: error.message }
    );
    sendJson(res, errorResponse, 500);
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

function handleString(action, body) {
  switch (action) {
    case 'sanitize':
      const stringResult = demoUtils.sanitizeString(body.input);
      return stringResult.error ? 
        createErrorResponse(stringResult.error, 'STRING_ERROR', { input: body.input }) :
        createSuccessResponse(stringResult);
    default:
      return createErrorResponse(
        'Unknown string action',
        'UNKNOWN_ACTION',
        { action, availableActions: ['sanitize'] }
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
        const fn = new Function('return ' + body.function)();
        const memoized = demoUtils.memoize(fn);
        const results = [];
        
        for (let i = 0; i < 3; i++) {
          results.push(memoized(...(body.args || [])));
        }
        
        const performanceResult = {
          demo: results,
          explanation: 'First call computes, subsequent calls return cached result'
        };
        return createSuccessResponse(performanceResult);
      } catch (error) {
        return createErrorResponse(
          'Failed to execute memoization demo',
          'PERFORMANCE_ERROR',
          { error: error.message }
        );
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
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
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
    </script>
</body>
</html>`;
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
  logger.info('Demo page served', { responseTime: Date.now() - startTime });
}

function serveStaticFile(req, res, path, startTime) {
  let filePath = path;
  if (path === '/') {
    filePath = '/demo.html';
  }
  
  // Try to serve from examples directory first
  const examplesPath = path.join(__dirname, 'examples', filePath);
  if (fs.existsSync(examplesPath)) {
    filePath = examplesPath;
  } else {
    filePath = path.join(__dirname, filePath);
  }
  
  const extname = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  }[extname] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
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