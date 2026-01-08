/**
 * Simple Demo Server - Focused Utility Demonstration
 * 
 * Purpose: Lightweight demo server showcasing QGenUtils functionality
 * Replaces the overly complex 1244-line server with focused examples
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Import QGenUtils utilities (when built)
let QGenUtils;
try {
  QGenUtils = require('./dist/index.js');
} catch (error) {
  console.log('⚠️  QGenUtils not built yet. Run `npm run build` first');
  process.exit(1);
}

const port = process.env.PORT || 3000;

// Simple request logging
const logger = {
  info: (msg, meta = {}) => console.log(`ℹ️  ${msg}`, meta),
  warn: (msg, meta = {}) => console.log(`⚠️  ${msg}`, meta),
  error: (msg, meta = {}) => console.error(`❌ ${msg}`, meta)
};

// Demo utilities that mirror QGenUtils functionality
const demoUtils = {
  // Validation examples
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return {
      isValid,
      message: isValid ? 'Valid email format' : 'Invalid email format',
      input: email
    };
  },

  validatePassword: (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
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
    if (!apiKey || typeof apiKey !== 'string') {
      return { original: apiKey, masked: '****', error: 'Invalid API key' };
    }
    
    if (apiKey.length <= 8) {
      return { original: apiKey, masked: '****' };
    }
    
    const masked = apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
    return { original: apiKey, masked };
  },

  sanitizeString: (input) => {
    if (typeof input !== 'string') {
      input = String(input || '');
    }
    
    const sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    return {
      original: input,
      sanitized,
      changed: input.length !== sanitized.length
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
    if (typeof bytes !== 'number' || bytes < 0) {
      return { error: 'Invalid bytes value', formatted: '0 B' };
    }
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    const formatted = `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
    
    return {
      bytes,
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

async function handleApiRequest(req, res, path, startTime) {
  if (req.method !== 'POST') {
    sendJson(res, { error: 'Method not allowed' }, 405);
    return;
  }

  try {
    const body = await parseRequestBody(req);
    const [, , category, action] = path.split('/');
    
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
        result = { error: 'Unknown endpoint category' };
    }
    
    sendJson(res, result);
    logger.info('API Request', { path, action, responseTime: Date.now() - startTime });
    
  } catch (error) {
    logger.error('API Request Error', { path, error: error.message });
    sendJson(res, { error: 'Request processing failed' }, 500);
  }
}

function handleValidation(action, body) {
  switch (action) {
    case 'email':
      return demoUtils.validateEmail(body.email);
    case 'password':
      return demoUtils.validatePassword(body.password);
    default:
      return { error: 'Unknown validation action' };
  }
}

function handleSecurity(action, body) {
  switch (action) {
    case 'mask-api-key':
      return demoUtils.maskApiKey(body.apiKey);
    case 'sanitize-string':
      return demoUtils.sanitizeString(body.input);
    default:
      return { error: 'Unknown security action' };
  }
}

function handleDateTime(action, body) {
  switch (action) {
    case 'format':
      return demoUtils.formatDateTime(body.date, body.format);
    default:
      return { error: 'Unknown datetime action' };
  }
}

function handleString(action, body) {
  switch (action) {
    case 'sanitize':
      return demoUtils.sanitizeString(body.input);
    default:
      return { error: 'Unknown string action' };
  }
}

function handleUrl(action, body) {
  switch (action) {
    case 'ensure-protocol':
      return demoUtils.ensureProtocol(body.url, body.protocol);
    default:
      return { error: 'Unknown URL action' };
  }
}

function handleFile(action, body) {
  switch (action) {
    case 'format-size':
      return demoUtils.formatFileSize(body.bytes);
    default:
      return { error: 'Unknown file action' };
  }
}

function handlePerformance(action, body) {
  switch (action) {
    case 'memoize':
      const fn = new Function('return ' + body.function)();
      const memoized = demoUtils.memoize(fn);
      const results = [];
      
      for (let i = 0; i < 3; i++) {
        results.push(memoized(...(body.args || [])));
      }
      
      return {
        demo: results,
        explanation: 'First call computes, subsequent calls return cached result'
      };
    default:
      return { error: 'Unknown performance action' };
  }
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, data, statusCode = 200) {
  const jsonData = JSON.stringify(data, null, 2);
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