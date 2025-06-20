
# QGenUtils - Comprehensive Utility Library

A security-first Node.js utility library providing authentication, HTTP operations, URL processing, validation, datetime formatting, and template rendering. Designed as a lightweight alternative to heavy npm packages with comprehensive error handling and fail-closed security patterns.

## Installation

```bash
npm install qgenutils
```

## Quick Start

```javascript
const utils = require('qgenutils');
// or import specific functions
const { formatDateTime, calculateContentLength, ensureProtocol } = require('qgenutils');
```


```javascript
const { logger } = require('qgenutils'); // Winston logger instance
```

## Features

- 🕐 **DateTime Utilities** - Format dates and calculate durations
- 🌐 **HTTP Utilities** - Content-length calculation, header management, response helpers
- 📮 **Response Utilities** - Standardized JSON and error responses
- 🔗 **URL Utilities** - Protocol handling, URL parsing and normalization
- ✅ **Validation** - Field presence and format checking
- 🔐 **Authentication** - Passport.js integration helpers
- 📄 **View Rendering** - EJS template rendering with error handling
- 📜 **Logging** - Winston logger with daily rotation

## API Reference

### DateTime Utilities

#### `formatDateTime(dateString)`
Converts ISO date string to locale-specific display format.

```javascript
const { formatDateTime } = require('qgenutils');

console.log(formatDateTime('2023-12-25T10:30:00.000Z'));
// Output: "12/25/2023, 10:30:00 AM" (locale-dependent)

console.log(formatDateTime(''));
// Output: "N/A"
```

#### `formatDuration(startDate, endDate?)`
Calculates elapsed time between dates in HH:MM:SS format.

```javascript
const { formatDuration } = require('qgenutils');

const start = '2023-12-25T10:00:00.000Z';
const end = '2023-12-25T11:30:45.000Z';

console.log(formatDuration(start, end)); // "01:30:45"
console.log(formatDuration(start)); // Duration from start to now
```

### HTTP Utilities

#### `calculateContentLength(body)`
Calculates accurate content-length for HTTP requests.

```javascript
const { calculateContentLength } = require('qgenutils');

console.log(calculateContentLength('Hello World')); // 11
console.log(calculateContentLength({ name: 'John' })); // JSON string length
console.log(calculateContentLength(null)); // 0
console.log(calculateContentLength(Buffer.from('Hi'))); // 2 // Buffer example
```

#### `buildCleanHeaders(headers, method, body)`
Builds clean headers for HTTP requests, removing dangerous headers.

```javascript
const { buildCleanHeaders } = require('qgenutils');

const headers = buildCleanHeaders({
  'authorization': 'Bearer token',
  'host': 'evil.com', // Will be removed
  'content-type': 'application/json'
}, 'POST', { data: 'test' });
```

#### `HEADERS_TO_REMOVE` constant
List of headers stripped by `buildCleanHeaders` to prevent proxy leaks.

```javascript
const { HEADERS_TO_REMOVE } = require('qgenutils');

console.log(HEADERS_TO_REMOVE.includes('host')); // true

```

#### `sendJsonResponse(res, statusCode, data)`
Sends standardized JSON responses.

```javascript
const { sendJsonResponse } = require('qgenutils');

sendJsonResponse(res, 200, { message: 'Success' });
sendJsonResponse(res, 400, { error: 'Invalid input' });
```

#### `sendValidationError(res, message, additionalData?, statusCode?)`

Sends a 400 error response when validation fails.


```javascript
const { sendValidationError } = require('qgenutils');

sendValidationError(res, 'Missing name field');
sendValidationError(res, 'Invalid email', { field: 'email' }, 422);
```

#### `sendAuthError(res, message?)`
Sends a 401 response for authentication failures.


```javascript
const { sendAuthError } = require('qgenutils');


if (!req.user) {
  sendAuthError(res);
}
```

#### `sendServerError(res, message?, error?, context?)`
Sends a 500 response and logs the error internally.


```javascript
const { sendServerError } = require('qgenutils');

try {
  // risky operation
} catch (err) {
  sendServerError(res, 'Processing failed', err, 'createUser');

}
```

#### `getRequiredHeader(req, res, headerName, statusCode, errorMessage)`
Extracts required headers with automatic error handling.

```javascript
const { getRequiredHeader } = require('qgenutils');

const auth = getRequiredHeader(req, res, 'authorization', 401, 'Auth header missing');
if (!auth) return; // Response already sent with error
```

### URL Utilities

#### `ensureProtocol(url)`
Adds HTTPS protocol if missing.

```javascript
const { ensureProtocol } = require('qgenutils');

console.log(ensureProtocol('example.com')); // "https://example.com"
console.log(ensureProtocol('http://example.com')); // "http://example.com"
```

#### `normalizeUrlOrigin(url)`
Normalizes URL to lowercase origin.

```javascript
const { normalizeUrlOrigin } = require('qgenutils');

console.log(normalizeUrlOrigin('HTTPS://Example.Com/path'));
// Output: "https://example.com"
```

#### `stripProtocol(url)`
Removes protocol from URL.

```javascript
const { stripProtocol } = require('qgenutils');

console.log(stripProtocol('https://example.com')); // "example.com"
```

#### `parseUrlParts(url)`
Parses URL into base and endpoint parts.

```javascript
const { parseUrlParts } = require('qgenutils');

console.log(parseUrlParts('example.com/api/users?id=123'));
// Output: { baseUrl: "https://example.com", endpoint: "/api/users?id=123" }
```

### Validation Utilities

#### `requireFields(obj, requiredFields, res?)`
Validates required fields presence.

```javascript
const { requireFields } = require('qgenutils');

const isValid = requireFields(
  { name: 'John', email: 'john@example.com' },
  ['name', 'email', 'age'],
  res
);
// If invalid, automatically sends 400 response with missing fields
```

### Input Validation Utilities

#### `isValidObject(obj)`
Checks if the value is a plain object.

```javascript
const { isValidObject } = require('qgenutils/lib/input-validation');

console.log(isValidObject({ foo: 'bar' })); // true
console.log(isValidObject(null)); // false
```

#### `isValidString(str)`
Checks if the value is a non-empty string.

```javascript
const { isValidString } = require('qgenutils/lib/input-validation');

console.log(isValidString('Hello')); // true
console.log(isValidString('   ')); // false
```

#### `hasMethod(obj, methodName)`
Determines whether an object exposes the given method.

```javascript
const { hasMethod } = require('qgenutils/lib/input-validation');

console.log(hasMethod(console, 'log')); // true
console.log(hasMethod({}, 'push')); // false
```

#### `isValidExpressResponse(res)`
Validates that an object looks like an Express response.

```javascript
const { isValidExpressResponse } = require('qgenutils/lib/input-validation');

if (!isValidExpressResponse(res)) {
  // handle invalid response object
}
```

### Authentication Utilities

#### `checkPassportAuth(req)`
Checks if user is authenticated via Passport.js.

```javascript
const { checkPassportAuth } = require('qgenutils');

if (!checkPassportAuth(req)) {
  return res.status(401).json({ error: 'Authentication required' });
}
```

#### `hasGithubStrategy()`
Checks if GitHub OAuth strategy is configured.

```javascript
const { hasGithubStrategy } = require('qgenutils');

// hasGithubStrategy reads global.passport to detect configuration
if (hasGithubStrategy()) {
  // Show GitHub login button
}
```

### View Utilities

#### `renderView(res, viewName, errorTitle)`
Renders EJS templates with error handling.

```javascript
const { renderView } = require('qgenutils');

renderView(res, 'dashboard', 'Error Rendering Dashboard');
// If template fails, an error page is automatically sent
```

#### `registerViewRoute(routePath, viewName, errorTitle)`
Registers Express routes for view rendering using the global `app` object.

```javascript
const { registerViewRoute } = require('qgenutils');

registerViewRoute('/dashboard', 'dashboard', 'Error Rendering Dashboard');
```

## Error Handling

All functions include robust error handling with:
- Graceful fallback values for invalid inputs
- Detailed error logging via `qerrors` integration
- User-friendly error messages
- Automatic HTTP error responses where appropriate

## Module Architecture

The library is organized into focused modules:

- `lib/datetime.js` - Date and time utilities
- `lib/http.js` - HTTP request/response helpers
- `lib/url.js` - URL manipulation functions
- `lib/validation.js` - Input validation utilities
- `lib/auth.js` - Authentication helpers
- `lib/logger.js` - Winston logger configuration
- `lib/views.js` - Template rendering utilities
- `lib/input-validation.js` - Common input sanity checks
- `lib/response-utils.js` - Standardized HTTP response helpers

## Testing

Install dependencies with `npm install` before running tests.

Run all unit and integration tests:

```bash
npm test
```

For targeted runs, additional scripts are available:

```bash
npm run test:unit       # run only unit tests
npm run test:integration # run only integration tests
npm run test:watch      # re-run tests on file changes
npm run test:coverage   # generate coverage reports
npm run test:verbose    # output detailed test information
```

Common Jest flags:

- `--watch` - re-run tests on file changes
- `--coverage` - generate coverage reports
- `--verbose` - output detailed test information

Pass flags after `--` when using npm, for example `npm test -- --watch`.

This command runs the entire test suite.

## Dependencies

- `qerrors` - Error tracking and analysis
- `winston-daily-rotate-file` - Logging support
- `@types/node` - TypeScript definitions
- `qtests` - Test utilities


## License

ISC

## Author

Q
