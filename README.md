
# QGenUtils - Comprehensive Security-First Utilities Library

A production-ready Node.js utility library providing comprehensive functionality for authentication, HTTP operations, URL processing, validation, datetime formatting, password security, and performance monitoring. Designed as a lightweight alternative to heavy npm packages with fail-closed security patterns and comprehensive error handling.

## Installation

This package is published to [GitHub Packages](https://github.com/bijikyu/qgenutils/packages).

1. Create or edit `.npmrc` in your project root:

```
@bijikyu:registry=https://npm.pkg.github.com
```

2. Authenticate with GitHub Packages (use a personal access token with `read:packages` scope):

```bash
npm login --scope=@bijikyu --registry=https://npm.pkg.github.com
```

3. Install the package:

```bash
npm install @bijikyu/qgenutils
```

### Usage

```js
// Core utilities (lightweight)
import { ... } from '@bijikyu/qgenutils';

// Full utilities bundle
import { ... } from '@bijikyu/qgenutils/full';
```

## Demo Server (Development & Testing)

**Important:** The demo server is for development and testing purposes only. It is **not** included in the npm package and should not be used in production.

### Running the Demo

```bash
# Clone the repository first
git clone <repository-url>
cd qgenutils

# Install dependencies and build
npm install
npm run build

# Start the demo server
npm run start-demo
```

Other demo servers:
- `npm run start-full-demo` (full-featured demo server)
- `npm run start-auth-demo` (auth example app + UI)

The demo server provides:
- **Interactive Web Interface**: Test core utilities at `http://localhost:3000`
- **REST API Endpoints**: Try utilities via HTTP requests
- **Live Documentation**: See functions in action with real data

### Demo API Endpoints

The demo server exposes these endpoints for testing:

- `POST /api/validate/email` - Email validation
- `POST /api/validate/password` - Password validation
- `POST /api/security/mask-api-key` - API key masking
- `POST /api/security/sanitize-string` - String sanitization
- `POST /api/datetime/format` - Date formatting
- `POST /api/url/ensure-protocol` - Protocol normalization
- `POST /api/file/format-size` - File size formatting
- `POST /api/performance/memoize` - Memoization demo

**Note:** These endpoints are for demonstration only and not part of the published package.

Admin dashboard (served by the demo server):
- Open `http://localhost:3000/admin-dashboard.html` (uses `GET /api/stats` and `POST /api/cache/clear`)

## Quick Start

```javascript
// CommonJS
const utils = require('@bijikyu/qgenutils');
const { formatDateTime, ensureProtocol, validateEmailFormat, memoize } = require('@bijikyu/qgenutils');

// ES Modules
import { formatDateTime, ensureProtocol, validateEmailFormat, memoize } from '@bijikyu/qgenutils';
```

## Usage

### Basic Examples

```javascript
// DateTime formatting - returns object with formatted property
const result = formatDateTime('2023-12-25T10:30:00.000Z');
console.log(result.formatted); // "12/25/2023, 10:30:00 AM"

// URL handling - returns object with processed property
const urlResult = ensureProtocol('example.com');
console.log(urlResult.processed); // "https://example.com"

// Input validation
const isValid = validateEmailFormat('user@example.com');
console.log(isValid); // true

// Performance optimization
const expensiveFn = memoize((n) => {
  // Simulate heavy computation
  return n * n;
});
console.log(expensiveFn(5)); // 25 (cached result)
```

### Advanced Examples

```javascript
// Password security
import { hashPassword, verifyPassword } from '@bijikyu/qgenutils';

const { hash, salt } = await hashPassword('securePassword123!');
const isValid = await verifyPassword('securePassword123!', hash, salt);

// Performance optimization
import { memoize, throttle, debounce } from '@bijikyu/qgenutils';

const expensiveFn = memoize((n) => heavyComputation(n));
const throttledSave = throttle(saveData, 1000);
const debouncedSearch = debounce(performSearch, 300);
```

## Examples

The library includes comprehensive examples for various use cases:

### Web Development
- Input validation and sanitization
- URL processing and validation
- Error handling and logging

### Security
- Password hashing and verification
- Input sanitization against XSS
- API key masking and validation

### Performance
- Memoization for expensive operations
- Throttling and debouncing
- Event loop monitoring

### Data Processing
- Date and time formatting
- File size formatting
- Basic data structures (Min-heap)

## Features

### 🔐 Security-First Utilities
- **Password Security** - OWASP-compliant hashing, verification, and secure generation
- **Input Validation** - Comprehensive validation with RFC 5322 email compliance
- **API Security** - Timing-safe comparisons, API key masking, rate limiting
- **Data Sanitization** - XSS prevention and injection-safe string processing

### 📡 HTTP & Network Utilities  
- **HTTP Configuration** - Dynamic timeouts, retry logic, header management
- **URL Processing** - Protocol enforcement, normalization, parsing
- **Authentication** - Basic auth, API key validation, middleware

### 📅 DateTime Utilities
- **Date Formatting** - ISO to locale conversion with timezone support
- **Duration Calculation** - Precise time interval formatting
- **Relative Time** - Human-friendly time display

### 📊 Data Structures
- **Data Structures** - Min-heap implementation for priority queues

### ⚡ Performance & Concurrency
- **Performance Monitoring** - Event loop lag, metrics collection
- **Optimization** - Memoize, throttle, debounce utilities

### 🛠️ Configuration & Security
- **Security Configuration** - Sensitive value masking and validation

### 📝 Logging & Monitoring
- **Structured Logging** - Winston-based with daily rotation
- **Error Tracking** - Comprehensive error handling with qerrors integration

## API Reference

### DateTime Utilities

#### `formatDateTime(dateString)`
Converts ISO date string to locale-specific display format. Returns an object with formatted result.

```javascript
const { formatDateTime } = require('@bijikyu/qgenutils');

const result = formatDateTime('2023-12-25T10:30:00.000Z');
console.log(result.formatted);
// Output: "12/25/2023, 10:30:00 AM" (locale-dependent)

const empty = formatDateTime('');
console.log(empty.formatted);
// Output: "N/A"
```

#### `formatDuration(startDate, endDate?)`
Calculates elapsed time between dates in HH:MM:SS format.

```javascript
const { formatDuration } = require('@bijikyu/qgenutils');

const start = '2023-12-25T10:00:00.000Z';
const end = '2023-12-25T11:30:45.000Z';

console.log(formatDuration(start, end)); // "01:30:45"
console.log(formatDuration(start)); // Duration from start to now
```

#### `formatRelativeTime(date)`
Returns human-friendly relative time (e.g., "5 minutes ago").

```javascript
const { formatRelativeTime } = require('@bijikyu/qgenutils');

console.log(formatRelativeTime(new Date(Date.now() - 60000))); // "1 minute ago"
```

#### `addDays(date, days)`
Adds days to a date.

```javascript
const { addDays } = require('@bijikyu/qgenutils');

const future = addDays(new Date(), 7); // 7 days from now
```

### URL Utilities

#### `ensureProtocol(url)`
Adds HTTPS protocol if missing. Returns an object with processed result.

```javascript
const { ensureProtocol } = require('@bijikyu/qgenutils');

const result1 = ensureProtocol('example.com');
console.log(result1.processed); // "https://example.com"

const result2 = ensureProtocol('http://example.com');
console.log(result2.processed); // "http://example.com"
```

#### `normalizeUrlOrigin(url)`
Normalizes URL to lowercase origin.

```javascript
const { normalizeUrlOrigin } = require('@bijikyu/qgenutils');

console.log(normalizeUrlOrigin('HTTPS://Example.Com/path'));
// Output: "https://example.com"
```

#### `stripProtocol(url)`
Removes protocol from URL.

```javascript
const { stripProtocol } = require('@bijikyu/qgenutils');

console.log(stripProtocol('https://example.com')); // "example.com"
```

#### `parseUrlParts(url)`
Parses URL into base and endpoint parts.

```javascript
const { parseUrlParts } = require('@bijikyu/qgenutils');

console.log(parseUrlParts('example.com/api/users?id=123'));
// Output: { baseUrl: "https://example.com", endpoint: "/api/users?id=123" }
```

### Available Utilities

#### Data Structures

```javascript
const { createMinHeap } = require('@bijikyu/qgenutils');

// Create a min-heap for priority queue operations
const heap = createMinHeap();
heap.insert(5);
heap.insert(2);
heap.insert(8);
console.log(heap.extractMin()); // 2 (smallest element)
```

### Performance Utilities

```javascript
const { memoize, throttle, debounce } = require('@bijikyu/qgenutils');

// Memoize expensive function
const cachedFn = memoize((x) => expensiveCalculation(x));

// Throttle to once per 1000ms
const throttled = throttle(() => saveData(), 1000);

// Debounce until 300ms of inactivity
const debounced = debounce(() => search(query), 300);
```

### Password Security

```javascript
const { hashPassword, verifyPassword, generateSecurePassword } = require('@bijikyu/qgenutils');

// Hash password with OWASP-compliant method
const { hash, salt } = await hashPassword('securePassword123!');

// Verify password
const isValid = await verifyPassword('securePassword123!', hash, salt);

// Generate secure random password
const securePassword = generateSecurePassword(16); // 16-character password
```

### Validation

```javascript
const { validateEmailFormat, validateUrl, validateNumber, validateString, validateArray, validateObject } = require('@bijikyu/qgenutils');

// Email validation
const emailValid = validateEmailFormat('user@example.com'); // true/false

// URL validation  
const urlValid = validateUrl('https://example.com'); // true/false

// Number validation
const numValid = validateNumber(42); // true/false

// String validation
const strValid = validateString('hello'); // true/false
```

## Error Handling

All functions include robust error handling with:
- Graceful fallback values for invalid inputs
- Detailed error logging via `qerrors` integration
- User-friendly error messages

## Backward Compatibility

This library maintains full backward compatibility with legacy systems. All previously available functions continue to work without any changes required.

### Legacy Functions Supported

The following legacy functions are available for backward compatibility:

#### DateTime Utilities
- `formatDateTime(dateString)` - Format ISO dates to locale display
- `formatDuration(startDate, endDate?)` - Calculate duration in HH:MM:SS
- `addDays(date, days)` - Add days to a date

#### URL Utilities  
- `ensureProtocol(url)` - Add HTTPS protocol if missing
- `normalizeUrlOrigin(url)` - Normalize URL to lowercase origin
- `stripProtocol(url)` - Remove protocol from URL
- `parseUrlParts(url)` - Parse URL into base and endpoint parts

#### Validation Utilities
- `validateEmail(email)` - Alias for `validateEmailFormat`

### Migration Path

While legacy functions continue to work, new projects should use the modern API:

```javascript
// Legacy (still supported)
const { formatDateTime, ensureProtocol, validateEmail } = require('@bijikyu/qgenutils');

// Modern (recommended)
import { formatDateTime, ensureProtocol, validateEmailFormat } from '@bijikyu/qgenutils';
```

### Compatibility Guarantees

- ✅ No breaking changes to existing APIs
- ✅ All legacy functions continue to work
- ✅ Same function signatures and return types
- ✅ Comprehensive error handling maintained
- ✅ Performance characteristics preserved

## Module Architecture

The library is organized into focused modules under `lib/utilities/`:

### 🔐 Security & Validation
- `security/` - API key handling, timing-safe comparisons, input sanitization
- `password/` - OWASP-compliant password hashing and verification
- `validation/` - Input validation for common data types

### 📡 Network & URL Processing  
- `url/` - URL processing, validation, and normalization

### 📊 Data Processing & Performance
- `performance/` - Optimization utilities (memoize, throttle, debounce)
- `data-structures/` - Efficient algorithms (Min-heap implementation)

### 📅 Core Utilities
- `datetime/` - Date and time manipulation and formatting
- `file/` - File size formatting utilities

### 📊 Monitoring & Logging
- `performance-monitor/` - Event loop lag and system metrics
- `logger/` - Structured logging with Winston integration

## Testing

Run all unit and integration tests:

```bash
npm test
```

For targeted runs:

```bash
npm run test:unit       # run only unit tests
npm run test:integration # run only integration tests
npm run test:watch      # re-run tests on file changes
npm run test:coverage   # generate coverage reports
```

## Dependencies

### Core Dependencies
- `qerrors` - Comprehensive error tracking and analysis
- `winston` & `winston-daily-rotate-file` - Production logging support
- `bcrypt` - Secure password hashing (OWASP compliant)
- `validator` - Industry-standard input validation
- `axios` - HTTP client with retry capabilities
- `date-fns` - Reliable date manipulation
- `sanitize-html` - XSS-safe HTML sanitization
- `express-rate-limit` & `helmet` - Security middleware
- `zod` - Schema-based validation with TypeScript integration

### Development Dependencies
- `@types/node` - Complete TypeScript definitions
- `qtests` - Comprehensive test utilities
- `typescript` - Type checking and compilation
- `jest` - Testing framework with coverage reporting

## License

ISC

## Author

Q
