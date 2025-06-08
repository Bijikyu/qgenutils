
# QGenUtils - Comprehensive Utility Library

A modular utility library providing datetime formatting, HTTP helpers, URL manipulation, authentication checks, field validation, and view rendering with robust error handling.

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

## Features

- 🕐 **DateTime Utilities** - Format dates and calculate durations
- 🌐 **HTTP Utilities** - Content-length calculation, header management, response helpers
- 🔗 **URL Utilities** - Protocol handling, URL parsing and normalization
- ✅ **Validation** - Field presence and format checking
- 🔐 **Authentication** - Passport.js integration helpers
- 📄 **View Rendering** - EJS template rendering with error handling

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
```

#### `buildCleanHeaders(method, originalHeaders, body?)`
Builds clean headers for HTTP requests, removing dangerous headers.

```javascript
const { buildCleanHeaders } = require('qgenutils');

const headers = buildCleanHeaders('POST', {
  'authorization': 'Bearer token',
  'host': 'evil.com', // Will be removed
  'content-type': 'application/json'
}, { data: 'test' });
```

#### `sendJsonResponse(res, statusCode, data)`
Sends standardized JSON responses.

```javascript
const { sendJsonResponse } = require('qgenutils');

sendJsonResponse(res, 200, { message: 'Success' });
sendJsonResponse(res, 400, { error: 'Invalid input' });
```

#### `getRequiredHeader(req, headerName, res?)`
Extracts required headers with automatic error handling.

```javascript
const { getRequiredHeader } = require('qgenutils');

const auth = getRequiredHeader(req, 'authorization', res);
if (!auth) return; // Response already sent with 401 error
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

### Authentication Utilities

#### `checkPassportAuth(req)`
Checks if user is authenticated via Passport.js.

```javascript
const { checkPassportAuth } = require('qgenutils');

if (!checkPassportAuth(req)) {
  return res.status(401).json({ error: 'Authentication required' });
}
```

#### `hasGithubStrategy(passport)`
Checks if GitHub OAuth strategy is configured.

```javascript
const { hasGithubStrategy } = require('qgenutils');

if (hasGithubStrategy(passport)) {
  // Show GitHub login button
}
```

### View Utilities

#### `renderView(viewName, data, res?)`
Renders EJS templates with error handling.

```javascript
const { renderView } = require('qgenutils');

const html = renderView('dashboard', { user: userData }, res);
// If template fails, automatically sends error page
```

#### `registerViewRoute(app, route, viewName, data?)`
Registers Express routes for view rendering.

```javascript
const { registerViewRoute } = require('qgenutils');

registerViewRoute(app, '/dashboard', 'dashboard', { title: 'Dashboard' });
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
- `lib/views.js` - Template rendering utilities

## Testing

Run the comprehensive test suite:

```bash
npm test
```

## Dependencies

- `qerrors` - Error tracking and analysis
- `winston-daily-rotate-file` - Logging support
- `@types/node` - TypeScript definitions

## License

ISC

## Author

Q
