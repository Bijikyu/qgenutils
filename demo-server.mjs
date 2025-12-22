import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import QGenUtils utilities  
import QGenUtils from './dist/index.js';

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
  
  // Add proper error handling for file operations
  const readStream = fs.createReadStream(fullPath);
  
  // Set up error handling before piping
  readStream.on('error', (err) => {
    console.error('File read error:', err);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
      } else if (err.code === 'EACCES') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Permission denied' }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });
  
  readStream.on('open', () => {
    // Only write headers if they haven't been sent yet
    if (!res.headersSent) {
      res.writeHead(200, { 'Content-Type': type });
    }
    readStream.pipe(res);
  });
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
    default:
      sendJSON(res, { error: 'Invalid API category' }, 404);
  }
}

// Validation handlers
async function handleValidation(req, res, action) {
  try {
    const body = await parseRequestBody(req);
    
    switch (action) {
      case 'email':
        if (QGenUtils.validateEmailFormat) {
          const result = QGenUtils.validateEmailFormat(body.email);
          sendJSON(res, { valid: result, email: body.email });
        } else {
          sendJSON(res, { error: 'Email validation not available' }, 501);
        }
        break;
      case 'password':
        if (QGenUtils.validatePasswordStrength) {
          const result = QGenUtils.validatePasswordStrength(body.password);
          sendJSON(res, { valid: result, password: body.password });
        } else {
          sendJSON(res, { error: 'Password validation not available' }, 501);
        }
        break;
      default:
        sendJSON(res, { error: 'Invalid validation action' }, 404);
    }
  } catch (error) {
    sendJSON(res, { error: error.message }, 500);
  }
}

// Security handlers
async function handleSecurity(req, res, action) {
  try {
    const body = await parseRequestBody(req);
    
    switch (action) {
      case 'sanitize':
        if (QGenUtils.sanitizeInput) {
          const result = QGenUtils.sanitizeInput(body.input);
          sendJSON(res, { sanitized: result, original: body.input });
        } else {
          sendJSON(res, { error: 'Input sanitization not available' }, 501);
        }
        break;
      default:
        sendJSON(res, { error: 'Invalid security action' }, 404);
    }
  } catch (error) {
    sendJSON(res, { error: error.message }, 500);
  }
}

// Collections handlers
async function handleCollections(req, res, action) {
  try {
    const body = await parseRequestBody(req);
    
    switch (action) {
      case 'groupby':
        // This would need to be implemented in the utilities
        sendJSON(res, { error: 'Group by not yet implemented' }, 501);
        break;
      default:
        sendJSON(res, { error: 'Invalid collections action' }, 404);
    }
  } catch (error) {
    sendJSON(res, { error: error.message }, 500);
  }
}

// Main server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const reqPath = url.pathname;
  const method = req.method;

  console.log(`${method} ${reqPath}`);

  // API routes
  if (reqPath.startsWith('/api/')) {
    await handleApiRequest(req, res, reqPath, method);
    return;
  }

  // Static file serving
  if (reqPath === '/') {
    serveFile(res, path.join(__dirname, 'demo.html'));
  } else if (reqPath.startsWith('/')) {
    const fullPath = path.join(__dirname, reqPath);
    serveFile(res, fullPath);
  } else {
    sendJSON(res, { error: 'Not found' }, 404);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`QGenUtils demo server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the demo`);
});