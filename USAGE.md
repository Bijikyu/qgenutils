# QGenUtils Usage Guide

## Installation

```bash
npm install qgenutils
```

## Quick Start

```javascript
const QGenUtils = require('qgenutils'); // import all utilities

// Or import individual functions
const { checkPassportAuth, requireFields, formatDateTime } = require('qgenutils');
```

## Authentication Utilities

### `checkPassportAuth(req)`

Check if a user is authenticated via Passport.js with fail-closed security.

```javascript
const { checkPassportAuth } = require('qgenutils');

app.get('/protected', (req, res) => {
  if (!checkPassportAuth(req)) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  res.json({ message: 'Welcome to protected area' });
});
```

**Security Features:**
- Returns `false` if Passport isn't configured
- Returns `false` on any authentication errors
- Logs all authentication attempts for security auditing

### `hasGithubStrategy()`

Detect if GitHub OAuth strategy is configured in Passport.js.

```javascript
const { hasGithubStrategy } = require('qgenutils');

app.get('/login-options', (req, res) => {
  const loginMethods = {
    local: true,
    // hasGithubStrategy reads global.passport to detect GitHub OAuth setup
    github: hasGithubStrategy()
  };
  
  res.json(loginMethods);
});
```

## Date and Time Utilities

### `formatDateTime(dateString)`

Format ISO date strings to human-readable format with fallback handling.

```javascript
const { formatDateTime } = require('qgenutils');

const userCreated = formatDateTime('2024-01-15T10:30:00.000Z');
// Returns: "1/15/2024, 10:30:00 AM"

const invalidDate = formatDateTime('invalid-date');
// Returns: "N/A"

const nullDate = formatDateTime(null);
// Returns: "N/A"
```

**Features:**
- Automatic fallback to "N/A" for invalid dates
- Handles null/undefined inputs gracefully
- Uses locale-appropriate formatting

### `formatDuration(startDate, endDate?)`

Calculate and format duration between dates in HH:MM:SS format.

```javascript
const { formatDuration } = require('qgenutils');

const start = '2024-01-15T10:00:00.000Z';
const end = '2024-01-15T12:30:45.000Z';

const duration = formatDuration(start, end);
// Returns: "02:30:45"

// Using current time as end date
const ongoing = formatDuration(start);
// Returns duration from start to now
```

## HTTP Utilities

### `calculateContentLength(body)`

Calculate accurate byte length for HTTP bodies with UTF-8 support.

```javascript
const { calculateContentLength } = require('qgenutils');

const textBody = "Hello, 世界!";
const length = calculateContentLength(textBody);
// Returns: "13" (accounts for UTF-8 encoding)

const jsonBody = { message: "Hello" };
const jsonLength = calculateContentLength(jsonBody);
// Returns: "20" (JSON.stringify byte length)

const buf = Buffer.from('Hi');
const bufLength = calculateContentLength(buf);
// Returns: "2" (binary length) // Buffer example
```

### `buildCleanHeaders(headers, method, body)`

Remove dangerous headers and recalculate content-length for proxy security.

```javascript
const { buildCleanHeaders } = require('qgenutils');

const originalHeaders = {
  'host': 'example.com',
  'x-forwarded-for': '192.168.1.1',
  'content-length': '100',
  'authorization': 'Bearer token123'
};

const cleanHeaders = buildCleanHeaders(originalHeaders, 'POST', { data: 'test' });
// Returns headers without 'host' and 'x-forwarded-for', with recalculated content-length
```

**Security Features:**
- Removes proxy-related headers that could cause issues
- Recalculates content-length to prevent HTTP smuggling
- Handles GET requests specially (removes content-length)

### `getRequiredHeader(req, res, headerName, statusCode, errorMessage)`

Extract required headers with automatic error responses.

```javascript
const { getRequiredHeader } = require('qgenutils');

app.post('/api/upload', (req, res) => {
  const contentType = getRequiredHeader(req, res, 'content-type', 400, 'Content-Type required');
  if (!contentType) return; // Error response already sent
  
  // Process upload...
});
```

## URL Utilities

### `ensureProtocol(url)`

Add HTTPS protocol to URLs that don't have one (security-first default).

```javascript
const { ensureProtocol } = require('qgenutils');

const httpsUrl = ensureProtocol('example.com');
// Returns: "https://example.com"

const existingProtocol = ensureProtocol('http://example.com');
// Returns: "http://example.com" (preserves existing)

const invalid = ensureProtocol('');
// Returns: null
```

### `normalizeUrlOrigin(url)`

Normalize URLs to lowercase origins for comparison and caching.

```javascript
const { normalizeUrlOrigin } = require('qgenutils');

const normalized = normalizeUrlOrigin('HTTP://EXAMPLE.COM/path?query=1');
// Returns: "http://example.com"

const withPort = normalizeUrlOrigin('https://api.example.com:8080/endpoint');
// Returns: "https://api.example.com:8080"
```

### `stripProtocol(url)`

Remove protocol and trailing slash for display purposes.

```javascript
const { stripProtocol } = require('qgenutils');

const clean = stripProtocol('https://example.com/');
// Returns: "example.com"

const withPath = stripProtocol('http://api.example.com/v1/users');
// Returns: "api.example.com/v1/users"
```

### `parseUrlParts(url)`

Split URLs into base URL and endpoint components.

```javascript
const { parseUrlParts } = require('qgenutils');

const parts = parseUrlParts('https://api.example.com/v1/users?limit=10');
// Returns: {
//   baseUrl: "https://api.example.com",
//   endpoint: "/v1/users?limit=10"
// }
```

## Validation Utilities

### `requireFields(obj, requiredFields, res)`

Validate required fields with detailed error responses.

```javascript
const { requireFields } = require('qgenutils');

app.post('/api/users', (req, res) => {
  if (!requireFields(req.body, ['name', 'email', 'password'], res)) {
    return; // Error response already sent
  }
  
  // All required fields are present
  // Continue with user creation...
});
```

**Features:**
- Lists ALL missing fields in single response
- Treats falsy values (null, '', 0, false) as missing
- Sends standardized error responses automatically
- Returns boolean for simple conditional logic

**Example Error Response:**
```json
{
  "error": "Missing required fields",
  "missing": ["email", "password"]
}
```

## Response Utilities

### `sendJsonResponse(res, statusCode, data)`

Send standardized JSON responses with proper headers.

```javascript
const { sendJsonResponse } = require('qgenutils');

app.get('/api/users', (req, res) => {
  const users = getUsersFromDatabase();
  sendJsonResponse(res, 200, { users, count: users.length });
});
```

### `sendValidationError(res, message, additionalData?, statusCode?)`

Send standardized validation error responses.

```javascript
const { sendValidationError } = require('qgenutils');

if (age < 18) {
  return sendValidationError(res, 'Must be 18 or older', { 
    provided: age, 
    minimum: 18 
  }, 400);
}
```

### `sendAuthError(res, message?)`

Send standardized authentication error responses.

```javascript
const { sendAuthError } = require('qgenutils');

if (!isValidToken(token)) {
  return sendAuthError(res, 'Invalid or expired token');
}
```

### `sendServerError(res, message?, error?, context?)`

Send standardized server error responses with internal logging.

```javascript
const { sendServerError } = require('qgenutils');

try {
  const result = await complexDatabaseOperation();
  sendJsonResponse(res, 200, result);
} catch (error) {
  sendServerError(res, 'Database operation failed', error, 'getUserProfile');
}
```

## View Utilities

### `renderView(res, viewName, errorTitle)`

Render EJS templates with graceful error handling.

```javascript
const { renderView } = require('qgenutils');

app.get('/dashboard', (req, res) => {
  renderView(res, 'dashboard', 'Dashboard Error');
});
```

**Error Handling:**
- Shows user-friendly error page if template fails
- Logs detailed error information for debugging
- Provides navigation back to home page
- Prevents application crashes from template errors

### `registerViewRoute(app, path, viewName, errorTitle)`

Register simple view routes with built-in error handling.

```javascript
const { registerViewRoute } = require('qgenutils');

registerViewRoute(app, '/about', 'about', 'About Page Error');
registerViewRoute(app, '/contact', 'contact', 'Contact Page Error');
```

## Input Validation Utilities

### `isValidObject(obj)`

Check if value is a plain object (not array or null).

```javascript
const { isValidObject } = require('qgenutils');

isValidObject({ name: 'John' }); // true
isValidObject([1, 2, 3]); // false
isValidObject(null); // false
isValidObject('string'); // false
```

### `isValidString(str)`

Check if value is a non-empty string after trimming.

```javascript
const { isValidString } = require('qgenutils');

isValidString('hello'); // true
isValidString('  '); // false (only whitespace)
isValidString(''); // false
isValidString(null); // false
```

### `hasMethod(obj, methodName)`

Check if object has a specific method.

```javascript
const { hasMethod } = require('qgenutils');

hasMethod(res, 'json'); // true for Express response
hasMethod({}, 'toString'); // true (inherited method)
hasMethod(null, 'method'); // false
```

### `isValidExpressResponse(res)`

Check if object is a valid Express response object.

```javascript
const { isValidExpressResponse } = require('qgenutils');

app.use((req, res, next) => {
  if (!isValidExpressResponse(res)) {
    throw new Error('Invalid response object');
  }
  next();
});
```

## Error Handling Patterns

### Basic Error Handling

```javascript
const { checkPassportAuth, sendAuthError, sendServerError } = require('qgenutils');

app.get('/protected', (req, res) => {
  try {
    if (!checkPassportAuth(req)) {
      return sendAuthError(res);
    }
    
    // Protected logic here
    sendJsonResponse(res, 200, { data: 'success' });
    
  } catch (error) {
    sendServerError(res, 'Operation failed', error, 'protectedRoute');
  }
});
```

### Validation Chain Pattern

```javascript
const { requireFields, isValidString, sendValidationError } = require('qgenutils');

app.post('/api/users', (req, res) => {
  // Step 1: Check required fields
  if (!requireFields(req.body, ['name', 'email'], res)) {
    return; // Error response already sent
  }
  
  // Step 2: Additional validation
  if (!isValidString(req.body.name) || req.body.name.length < 2) {
    return sendValidationError(res, 'Name must be at least 2 characters');
  }
  
  // Step 3: Process valid request
  createUser(req.body);
  sendJsonResponse(res, 201, { success: true });
});
```

## Best Practices

### 1. Always Handle Authentication First

```javascript
app.use('/api/protected/*', (req, res, next) => {
  if (!checkPassportAuth(req)) {
    return sendAuthError(res);
  }
  next();
});
```

### 2. Use Validation Chains for Complex Input

```javascript
function validateUserInput(req, res) {
  if (!requireFields(req.body, ['email', 'password'], res)) return false;
  if (!isValidString(req.body.email)) {
    sendValidationError(res, 'Valid email required');
    return false;
  }
  return true;
}
```

### 3. Standardize URL Processing

```javascript
function processUserUrl(userInput) {
  const urlWithProtocol = ensureProtocol(userInput); // Adds HTTPS
  const normalized = normalizeUrlOrigin(urlWithProtocol); // For comparison
  const { baseUrl, endpoint } = parseUrlParts(urlWithProtocol); // For routing
  
  return { normalized, baseUrl, endpoint };
}
```

### 4. Consistent Error Responses

```javascript
// Good: Use utility functions for consistent responses
sendValidationError(res, 'Invalid input', { field: 'email' });
sendAuthError(res, 'Token expired');
sendServerError(res, 'Database error', error, 'userCreate');

// Avoid: Manual response construction
res.status(400).json({ error: 'Bad request' }); // Inconsistent format
```

### 5. Leverage Built-in Logging

All utilities automatically log operations for debugging:

```javascript
// Automatic logging is built into all functions
const duration = formatDuration(start, end);
// Logs: "formatDuration is running with 2024-01-15T10:00:00.000Z and 2024-01-15T12:00:00.000Z"
// Logs: "formatDuration is returning 02:00:00"
```

## Common Use Cases

### API Endpoint Template

```javascript
const { 
  checkPassportAuth, 
  requireFields, 
  sendJsonResponse, 
  sendAuthError, 
  sendServerError 
} = require('qgenutils');

app.post('/api/resource', async (req, res) => {
  try {
    // Authentication
    if (!checkPassportAuth(req)) {
      return sendAuthError(res);
    }
    
    // Validation
    if (!requireFields(req.body, ['name', 'type'], res)) {
      return;
    }
    
    // Business logic
    const result = await createResource(req.body);
    
    // Success response
    sendJsonResponse(res, 201, { resource: result });
    
  } catch (error) {
    sendServerError(res, 'Failed to create resource', error, 'createResource');
  }
});
```

### Proxy Request Processing

```javascript
const { buildCleanHeaders, ensureProtocol, parseUrlParts } = require('qgenutils');

async function proxyRequest(req, res) {
  const targetUrl = ensureProtocol(req.body.url);
  const { baseUrl, endpoint } = parseUrlParts(targetUrl);
  const cleanHeaders = buildCleanHeaders(req.headers, req.method, req.body);
  
  // Forward request with cleaned headers
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: req.method,
    headers: cleanHeaders,
    body: req.body ? JSON.stringify(req.body) : undefined
  });
  
  sendJsonResponse(res, response.status, await response.json());
}
```

This usage guide covers all major functionality with practical examples and security considerations.