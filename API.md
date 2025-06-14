# QGenUtils API Reference

## Overview

QGenUtils provides utilities organized into focused modules. Each function follows consistent patterns for error handling, logging, and security.

### Importing

```javascript
const utils = require('qgenutils');
```

## Authentication Module (`auth`)

### `checkPassportAuth(req)`

Verify user authentication status via Passport.js with fail-closed security.

**Parameters:**
- `req` (Object): Express request object with Passport methods

**Returns:**
- `boolean`: `true` if authenticated, `false` otherwise

**Security Behavior:**
- Returns `false` if Passport isn't configured
- Returns `false` on any authentication errors
- Logs all authentication attempts for auditing

**Example:**
```javascript
const { checkPassportAuth } = require('qgenutils');

if (!checkPassportAuth(req)) {
  return res.status(401).json({ error: 'Authentication required' });
}
```

### `hasGithubStrategy()`

Detect if GitHub OAuth strategy is configured in Passport.js.

**Parameters:**
- None

**Returns:**
- `boolean`: `true` if GitHub strategy is available, `false` otherwise

**Error Handling:**
- Returns `false` if Passport isn't available
- Returns `false` if strategy detection fails

**Example:**
```javascript
const { hasGithubStrategy } = require('qgenutils');

// hasGithubStrategy checks global.passport for configured strategies
const showGithubLogin = hasGithubStrategy();
```

## DateTime Module (`datetime`)

### `formatDateTime(dateString)`

Format ISO date strings to human-readable format with fallback handling.

**Parameters:**
- `dateString` (string): ISO 8601 date string

**Returns:**
- `string`: Formatted date/time or "N/A" for invalid inputs

**Fallback Behavior:**
- Returns "N/A" for null/undefined inputs
- Returns "N/A" for invalid date strings
- Uses locale-appropriate formatting for valid dates

**Example:**
```javascript
const { formatDateTime } = require('qgenutils');

formatDateTime('2024-01-15T10:30:00.000Z'); // "1/15/2024, 10:30:00 AM"
formatDateTime(null); // "N/A"
```

### `formatDuration(startDateString, endDateString?)`

Calculate duration between dates in HH:MM:SS format.

**Parameters:**
- `startDateString` (string): ISO 8601 start date
- `endDateString` (string, optional): ISO 8601 end date (defaults to current time)

**Returns:**
- `string`: Duration in "HH:MM:SS" format or "00:00:00" for invalid inputs

**Calculation Method:**
- Uses absolute difference (handles reversed date order)
- Converts milliseconds to hours:minutes:seconds
- Zero-pads all components for consistent display

**Example:**
```javascript
const { formatDuration } = require('qgenutils');

formatDuration('2024-01-15T10:00:00Z', '2024-01-15T12:30:45Z'); // "02:30:45"
formatDuration('2024-01-15T10:00:00Z'); // Duration to current time
```

## HTTP Module (`http`)

### `calculateContentLength(body)`

Calculate accurate byte length for HTTP bodies with UTF-8 support.

**Parameters:**
- `body` (any): Content to calculate length for (string, object, null, etc.)

**Returns:**
- `string`: Content length as string (HTTP headers require string format)

**Throws:**
- `TypeError`: If body is undefined (indicates coding error)

**Type Handling:**
- `null`: Returns "0"
- `string`: Uses `Buffer.byteLength()` for UTF-8 accuracy
- `object`: JSON stringifies then calculates bytes
- Empty objects/strings: Returns "0"
- `Buffer`: Uses body.length directly for binary payloads // Buffer bullet

**Example:**
```javascript
const { calculateContentLength } = require('qgenutils');

calculateContentLength("Hello, 世界!"); // "13" (UTF-8 bytes)
calculateContentLength({ msg: "hi" }); // "12" (JSON bytes)
calculateContentLength(null); // "0"
calculateContentLength(Buffer.from('Hi')); // "2" (binary bytes) // Buffer example
```

### `buildCleanHeaders(headers, method, body)`

Remove dangerous headers and recalculate content-length for proxy security.

**Parameters:**
- `headers` (Object): Original request headers
- `method` (string): HTTP method (GET, POST, etc.)
- `body` (any): Request body content

**Returns:**
- `Object`: Cleaned headers safe for forwarding

**Header Cleaning:**
- Removes `host`, `x-target-url`, `x-api-key`, `cdn-loop`, `cf-connecting-ip`
- Removes `cf-ipcountry`, `cf-ray`, `cf-visitor`, `render-proxy-ttl`, `connection`
- Recalculates `content-length` for non-GET requests with bodies
- Removes `content-length` from GET requests (HTTP spec compliance)

**Example:**
```javascript
const { buildCleanHeaders } = require('qgenutils');

const cleaned = buildCleanHeaders(
  { 'host': 'evil.com', 'authorization': 'Bearer token' },
  'POST',
  { data: 'test' }
);
// Returns: { 'authorization': 'Bearer token', 'content-length': '15' }
```

### `HEADERS_TO_REMOVE` constant

Immutable array of headers removed by `buildCleanHeaders` for safer proxies. Exported from `lib/http.js`.

```javascript
const { HEADERS_TO_REMOVE } = require('qgenutils');

console.log(HEADERS_TO_REMOVE);

```

### `getRequiredHeader(req, res, headerName, statusCode, errorMessage)`

Extract required headers with automatic error responses.

**Parameters:**
- `req` (Object): Express request object
- `res` (Object): Express response object
- `headerName` (string): Header name to extract
- `statusCode` (number): Error status code if header missing
- `errorMessage` (string): Error message for missing header

**Returns:**
- `string|null`: Header value or null if missing (error response sent)

**Behavior:**
- Returns header value if present
- Sends error response and returns null if missing
- Handles case-insensitive header lookup

**Example:**
```javascript
const { getRequiredHeader } = require('qgenutils');

const contentType = getRequiredHeader(req, res, 'content-type', 400, 'Content-Type required');
if (!contentType) return; // Error already sent
```

## URL Module (`url`)

### `ensureProtocol(url)`

Add HTTPS protocol to URLs that don't have one (security-first default).

**Parameters:**
- `url` (string): URL to process

**Returns:**
- `string|null`: URL with protocol or null if invalid

**Protocol Logic:**
- Defaults to HTTPS for security
- Preserves existing HTTP/HTTPS protocols
- Returns null for invalid inputs (empty strings, non-strings)
- Case-insensitive protocol detection

**Example:**
```javascript
const { ensureProtocol } = require('qgenutils');

ensureProtocol('example.com'); // "https://example.com"
ensureProtocol('http://example.com'); // "http://example.com" (preserved)
ensureProtocol(''); // null
```

### `normalizeUrlOrigin(url)`

Normalize URLs to lowercase origins for comparison and caching.

**Parameters:**
- `url` (string): URL to normalize

**Returns:**
- `string|null`: Normalized origin or null if parsing fails

**Normalization Process:**
1. Adds protocol via `ensureProtocol()`
2. Extracts origin (protocol + domain + port)
3. Converts hostname to lowercase
4. Preserves explicit ports (including standard ports)

**Example:**
```javascript
const { normalizeUrlOrigin } = require('qgenutils');

normalizeUrlOrigin('HTTP://EXAMPLE.COM/path'); // "http://example.com"
normalizeUrlOrigin('https://API.EXAMPLE.COM:8080'); // "https://api.example.com:8080"
```

### `stripProtocol(url)`

Remove protocol and trailing slash for display purposes.

**Parameters:**
- `url` (string): URL to clean

**Returns:**
- `string`: URL without protocol prefix or trailing slash

**Cleaning Process:**
- Removes `http://` or `https://` (case-insensitive)
- Removes trailing slash
- Preserves path, query parameters, and fragments

**Example:**
```javascript
const { stripProtocol } = require('qgenutils');

stripProtocol('https://example.com/'); // "example.com"
stripProtocol('HTTP://api.example.com/v1/users'); // "api.example.com/v1/users"
```

### `parseUrlParts(url)`

Split URLs into base URL and endpoint components.

**Parameters:**
- `url` (string): Complete URL to parse

**Returns:**
- `Object|null`: `{ baseUrl, endpoint }` or null if parsing fails

**Parsing Logic:**
- `baseUrl`: Origin only (protocol + domain + port)
- `endpoint`: Path + query string + fragment
- Uses `ensureProtocol()` for preprocessing

**Example:**
```javascript
const { parseUrlParts } = require('qgenutils');

parseUrlParts('https://api.example.com/v1/users?limit=10');
// Returns: {
//   baseUrl: "https://api.example.com",
//   endpoint: "/v1/users?limit=10"
// }
```

## Validation Module (`validation`)

### `requireFields(obj, requiredFields, res)`

Validate required fields with detailed error responses.

**Parameters:**
- `obj` (Object): Object to validate (typically `req.body`)
- `requiredFields` (Array): Array of required field names
- `res` (Object): Express response object for error responses

**Returns:**
- `boolean`: `true` if all fields present, `false` if validation failed

**Validation Logic:**
- Checks for truthy values (null, '', 0, false are considered missing)
- Collects ALL missing fields before responding
- Sends detailed error response with missing field list
- Returns boolean for simple conditional logic

**Error Response Format:**
```json
{
  "error": "Missing required fields",
  "missing": ["field1", "field2"]
}
```

**Example:**
```javascript
const { requireFields } = require('qgenutils');

if (!requireFields(req.body, ['name', 'email', 'password'], res)) {
  return; // Error response already sent
}
// Continue processing...
```

## Response Utilities Module (`responseUtils`)

### `sendJsonResponse(res, statusCode, data)`

Send standardized JSON responses with proper headers.

**Parameters:**
- `res` (Object): Express response object
- `statusCode` (number): HTTP status code
- `data` (Object): Response data to JSON serialize

**Behavior:**
- Validates response object before use
- Uses Express's built-in `json()` method
- Logs all responses for debugging
- Sets appropriate Content-Type headers

**Example:**
```javascript
const { sendJsonResponse } = require('qgenutils');

sendJsonResponse(res, 200, { users: [], count: 0 });
```

### `sendValidationError(res, message, additionalData?, statusCode?)`

Send standardized validation error responses.

**Parameters:**
- `res` (Object): Express response object
- `message` (string): Error message
- `additionalData` (Object, optional): Additional error context
- `statusCode` (number, optional): HTTP status code (defaults to 400)

**Response Format:**
```json
{
  "error": "Error message",
  "field": "additional data"
}
```

**Example:**
```javascript
const { sendValidationError } = require('qgenutils');

sendValidationError(res, 'Invalid email format', { provided: 'invalid-email' });
```

### `sendAuthError(res, message?)`

Send standardized authentication error responses.

**Parameters:**
- `res` (Object): Express response object  
- `message` (string, optional): Error message (defaults to "Authentication required")

**Behavior:**
- Always uses 401 status code
- Logs authentication failures for security monitoring
- Uses generic messages to prevent information disclosure

**Example:**
```javascript
const { sendAuthError } = require('qgenutils');

sendAuthError(res, 'Token expired');
```

### `sendServerError(res, message?, error?, context?)`

Send standardized server error responses with internal logging.

**Parameters:**
- `res` (Object): Express response object
- `message` (string, optional): Public error message
- `error` (Error, optional): Original error object for logging
- `context` (string, optional): Context information for debugging

**Security Features:**
- Sends generic message to client
- Logs detailed error internally via qerrors
- Never exposes stack traces or internal details
- Uses 500 status code

**Example:**
```javascript
const { sendServerError } = require('qgenutils');

try {
  await riskyOperation();
} catch (error) {
  sendServerError(res, 'Operation failed', error, 'userController');
}
```

## View Utilities Module (`views`)

### `renderView(res, viewName, errorTitle)`

Render EJS templates with graceful error handling.

**Parameters:**
- `res` (Object): Express response object
- `viewName` (string): Template name to render
- `errorTitle` (string): Error page title if rendering fails

**Error Handling:**
- Attempts template rendering first
- Shows user-friendly error page on failure
- Logs detailed error information for debugging
- Provides navigation back to home page
- Uses 500 status code for template errors

**Example:**
```javascript
const { renderView } = require('qgenutils');

renderView(res, 'dashboard', 'Dashboard Error');
```

### `registerViewRoute(app, path, viewName, errorTitle)`

Register simple view routes with built-in error handling.

**Parameters:**
- `app` (Object): Express application object
- `path` (string): Route path
- `viewName` (string): Template to render
- `errorTitle` (string): Error page title

**Behavior:**
- Creates GET route handler
- Integrates with `renderView()` for error handling
- Logs route registration for debugging

**Example:**
```javascript
const { registerViewRoute } = require('qgenutils');

registerViewRoute(app, '/about', 'about', 'About Page Error');
```

## Input Validation Module (`inputValidation`)

### `isValidObject(obj)`

Check if value is a plain object (not array or null).

**Parameters:**
- `obj` (any): Value to validate

**Returns:**
- `boolean`: `true` if plain object, `false` otherwise

**Validation Logic:**
- Returns `false` for null, undefined, arrays
- Returns `true` only for plain objects
- Uses strict type checking

**Example:**
```javascript
const { isValidObject } = require('qgenutils/lib/input-validation');

isValidObject({ key: 'value' }); // true
isValidObject([1, 2, 3]); // false
isValidObject(null); // false
```

### `isValidString(str)`

Check if value is a non-empty string after trimming.

**Parameters:**
- `str` (any): Value to validate

**Returns:**
- `boolean`: `true` if non-empty string, `false` otherwise

**Validation Logic:**
- Returns `false` for non-string types
- Trims whitespace before checking length
- Returns `false` for empty or whitespace-only strings

**Example:**
```javascript
const { isValidString } = require('qgenutils/lib/input-validation');

isValidString('hello'); // true
isValidString('  '); // false (whitespace only)
isValidString(''); // false
```

### `hasMethod(obj, methodName)`

Check if object has a specific method.

**Parameters:**
- `obj` (any): Object to check
- `methodName` (string): Method name to look for

**Returns:**
- `boolean`: `true` if method exists, `false` otherwise

**Method Detection:**
- Checks for method existence and callable type
- Includes inherited methods (not just own properties)
- Safe for null/undefined objects

**Example:**
```javascript
const { hasMethod } = require('qgenutils/lib/input-validation');

hasMethod(res, 'json'); // true for Express response
hasMethod({}, 'toString'); // true (inherited)
hasMethod(null, 'method'); // false
```

### `isValidExpressResponse(res)`

Check if object is a valid Express response object.

**Parameters:**
- `res` (any): Object to validate

**Returns:**
- `boolean`: `true` if valid Express response, `false` otherwise

**Validation Criteria:**
- Must have `status()` method
- Must have `json()` method
- Uses `hasMethod()` for safe checking

**Example:**
```javascript
const { isValidExpressResponse } = require('qgenutils/lib/input-validation');

if (!isValidExpressResponse(res)) {
  throw new Error('Invalid response object');
}
```

## Error Handling

All utilities follow consistent error handling patterns:

### Logging
- All operations are logged for debugging
- Errors are logged via qerrors with context
- Sensitive information is never logged

### Security
- Fail-closed: Default to most secure state on errors
- Generic error messages prevent information disclosure
- Detailed errors logged internally only

### Response Patterns
- Use response utilities for consistent error formats
- Validate inputs before processing
- Handle edge cases gracefully

## Common Patterns

### Authentication Check
```javascript
if (!checkPassportAuth(req)) {
  return sendAuthError(res);
}
```

### Field Validation
```javascript
if (!requireFields(req.body, ['field1', 'field2'], res)) {
  return; // Error already sent
}
```

### URL Processing
```javascript
const safeUrl = ensureProtocol(userInput);
const { baseUrl, endpoint } = parseUrlParts(safeUrl);
```

### Error Response
```javascript
try {
  // risky operation
} catch (error) {
  sendServerError(res, 'Operation failed', error, 'functionName');
}
```

## Logger

The library exports a configured Winston logger instance. It rotates files daily using `winston-daily-rotate-file` and retains logs for two weeks. Use this logger to record application events or debugging details.

```javascript
const { logger } = require('qgenutils');

logger.info('Utility initialized');
```

All functions include comprehensive logging and follow the fail-closed security model for production reliability.