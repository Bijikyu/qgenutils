const http = require('http');
const fs = require('fs');
const path = require('path');

// Import QGenUtils utilities
const QGenUtils = require('./index.js');

const root = process.cwd();
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

function serveFile(res, fullPath) {
  const ext = path.extname(fullPath);
  const type = mime[ext] || 'text/plain';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(fullPath).pipe(res);
}

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
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

// API endpoint handlers
async function handleApiRequest(req, res, reqPath, method) {
  const pathParts = reqPath.replace('/api/', '').split('/');
  const category = pathParts[0];
  const action = pathParts[1];
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Route to appropriate handler
  switch (category) {
    case 'validate':
      await handleValidation(req, res, action);
      break;
    case 'security':
      await handleSecurity(req, res, action);
      break;
    case 'collections':
      await handleCollections(req, res, action);
      break;
    case 'datetime':
      await handleDateTime(req, res, action);
      break;
    case 'performance':
      await handlePerformance(req, res, action);
      break;
    default:
      sendJSON(res, { error: 'Unknown API endpoint' }, 404);
  }
}

async function handleValidation(req, res, action) {
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

async function handleSecurity(req, res, action) {
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

async function handleCollections(req, res, action) {
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

async function handleDateTime(req, res, action) {
  if (method !== 'POST') {
    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }
  
  const data = await parseRequestBody(req);
  
  switch (action) {
    case 'add-days':
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

async function handlePerformance(req, res, action) {
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

const server = http.createServer(async (req, res) => {
  const parsedUrl = req.url.split('?');
  let reqPath = parsedUrl[0];
  const method = req.method;
  
  // Handle API endpoints
  if (reqPath.startsWith('/api/')) {
    try {
      await handleApiRequest(req, res, reqPath, method);
    } catch (error) {
      sendJSON(res, { error: 'Internal server error', message: error.message }, 500);
    }
    return;
  }
  
  // Serve static files
  if (reqPath === '/') reqPath = '/demo.html';
  const fullPath = path.join(root, reqPath);
  fs.stat(fullPath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    serveFile(res, fullPath);
  });
});

const port = process.env.DEMO_PORT || 3000;
server.listen(port, () => {
  console.log(`Demo server listening on http://localhost:${port}`);
});
