/**
 * Simple Demo Server - Basic HTTP Server for Testing
 * 
 * Purpose: Provides a minimal demo server for testing QGenUtils functionality
 * without complex imports that might cause ESM/CommonJS issues.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple demo utilities
const DemoUtils = {
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? 'Valid email format' : 'Invalid email format'
    };
  },

  formatDate: (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  },

  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }
};

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    handleApiRequest(req, res, path, req.method);
    return;
  }

  // Serve static files
  serveStaticFile(req, res, path);
});

function handleApiRequest(req, res, path, method) {
  console.log('API Request:', { method, path, url: req.url });
  
  if (method !== 'POST') {
    sendJson(res, { error: 'Method not allowed' }, 405);
    return;
  }

  const body = parseRequestBody(req);
  const [, category, action] = path.split('/');
  console.log('Parsed path:', { category, action });

  setTimeout(() => {
    switch (category) {
      case 'validate':
        handleValidation(req, res, action, body);
        break;
      case 'datetime':
        handleDateTime(req, res, action, body);
        break;
      case 'collections':
        handleCollections(req, res, action, body);
        break;
      default:
        sendJson(res, { error: 'Unknown endpoint' }, 404);
    }
  }, 100); // Small delay to simulate async processing
}

function handleValidation(req, res, action, body) {
  let result;
  switch (action) {
    case 'email':
      result = DemoUtils.validateEmail(body.email);
      break;
    default:
      result = { error: 'Unknown validation action' };
  }
  sendJson(res, result);
}

function handleDateTime(req, res, action, body) {
  let result;
  switch (action) {
    case 'format':
      result = DemoUtils.formatDate(body.date);
      break;
    default:
      result = { error: 'Unknown datetime action' };
  }
  sendJson(res, result);
}

function handleCollections(req, res, action, body) {
  let result;
  switch (action) {
    case 'group-by':
      if (Array.isArray(body.array) && body.key) {
        result = DemoUtils.groupBy(body.array, body.key);
      } else {
        result = { error: 'Invalid parameters' };
      }
      break;
    default:
      result = { error: 'Unknown collections action' };
  }
  sendJson(res, result);
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
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function serveStaticFile(req, res, path) {
  if (path === '/') path = '/demo.html';
  
  const filePath = path.join(__dirname, path);
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
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

server.listen(port, () => {
  console.log(`Simple Demo Server listening on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  POST /api/validate/email - Email validation');
  console.log('  POST /api/datetime/format - Date formatting');
  console.log('  POST /api/collections/group-by - Array grouping');
  console.log('  Open http://localhost:3000 for demo interface');
});