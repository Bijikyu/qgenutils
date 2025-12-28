
# QGenUtils - Comprehensive Security-First Utilities Library

A production-ready Node.js utility library providing comprehensive functionality for authentication, HTTP operations, URL processing, validation, datetime formatting, password security, and performance monitoring. Designed as a lightweight alternative to heavy npm packages with fail-closed security patterns and comprehensive error handling.

## Installation

```bash
npm install qgenutils
```

## Quick Start

```javascript
const utils = require('qgenutils');
// or import specific functions
const { formatDateTime, ensureProtocol, groupBy, chunk } = require('qgenutils');
```

```javascript
const { logger } = require('qgenutils'); // Winston logger instance
```

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

### 📊 Collections & Data Structures
- **Array Manipulation** - groupBy, chunk, partition, unique, shuffle
- **Object Utilities** - deepMerge, pick, omit, nested value access
- **Data Structures** - Min-heap implementation for priority queues

### ⚡ Performance & Concurrency
- **Batch Processing** - Semaphore-based concurrency control
- **Retry Logic** - Exponential backoff with jitter
- **Performance Monitoring** - Event loop lag, metrics collection
- **Optimization** - Memoize, throttle, debounce utilities

### 🛠️ Configuration & Module Management
- **Secure Configuration** - Sensitive value masking and validation
- **Module Loading** - Dynamic imports with caching
- **ID Generation** - Cryptographically secure identifiers

### 📝 Logging & Monitoring
- **Structured Logging** - Winston-based with daily rotation
- **Error Tracking** - Comprehensive error handling with qerrors integration

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

#### `formatRelativeTime(date)`
Returns human-friendly relative time (e.g., "5 minutes ago").

```javascript
const { formatRelativeTime } = require('qgenutils');

console.log(formatRelativeTime(new Date(Date.now() - 60000))); // "1 minute ago"
```

#### `addDays(date, days)`
Adds days to a date.

```javascript
const { addDays } = require('qgenutils');

const future = addDays(new Date(), 7); // 7 days from now
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

### Collection Utilities

#### Array Utilities

```javascript
const { groupBy, partition, unique, chunk, flatten, sortBy, shuffle, take, skip } = require('qgenutils');

// Group by key
groupBy([{type: 'a', v: 1}, {type: 'b', v: 2}], x => x.type);
// { a: [{type: 'a', v: 1}], b: [{type: 'b', v: 2}] }

// Partition by predicate
partition([1, 2, 3, 4], x => x % 2 === 0); // [[2, 4], [1, 3]]

// Unique values
unique([1, 2, 2, 3]); // [1, 2, 3]

// Chunk array
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// Flatten nested arrays
flatten([[1, 2], [3, [4, 5]]]); // [1, 2, 3, 4, 5]
```

#### Object Utilities

```javascript
const { pick, omit, deepMerge, deepClone, getNestedValue, setNestedValue, isEqual } = require('qgenutils');

// Pick specific keys
pick({ a: 1, b: 2, c: 3 }, ['a', 'b']); // { a: 1, b: 2 }

// Omit specific keys
omit({ a: 1, b: 2, c: 3 }, ['c']); // { a: 1, b: 2 }

// Deep merge objects
deepMerge({ a: { b: 1 } }, { a: { c: 2 } }); // { a: { b: 1, c: 2 } }

// Deep clone
const clone = deepClone({ nested: { value: 1 } });

// Get nested value safely
getNestedValue({ a: { b: { c: 1 } } }, 'a.b.c'); // 1

// Deep equality check
isEqual({ a: 1 }, { a: 1 }); // true
```

### Batch Processing

```javascript
const { createSemaphore, retryWithBackoff, processBatch } = require('qgenutils');

// Concurrency control
const semaphore = createSemaphore(3); // max 3 concurrent
await semaphore.acquire();
// ... do work
semaphore.release();

// Retry with exponential backoff
const result = await retryWithBackoff(async () => {
  return await fetchData();
}, { maxRetries: 3, initialDelay: 100 });

// Process array with concurrency and progress tracking
await processBatch(items, async (item) => {
  return await processItem(item);
}, { concurrency: 5, onProgress: (done, total) => console.log(`${done}/${total}`) });
```

### Performance Utilities

```javascript
const { memoize, throttle, debounce } = require('qgenutils');

// Memoize expensive function
const cachedFn = memoize((x) => expensiveCalculation(x));

// Throttle to once per 1000ms
const throttled = throttle(() => saveData(), 1000);

// Debounce until 300ms of inactivity
const debounced = debounce(() => search(query), 300);
```

### HTTP Configuration

```javascript
const { createJsonHeaders, createBasicAuth, createHttpConfig, getContextualTimeout } = require('qgenutils');

// Create JSON headers
const headers = createJsonHeaders({ 'X-Custom': 'value' });

// Create basic auth
const auth = createBasicAuth('user', 'pass');

// Get contextual timeout
const timeout = getContextualTimeout('payment'); // returns appropriate timeout for payment operations

// Create complete HTTP config
const config = createHttpConfig({
  method: 'POST',
  headers: { 'X-Api-Key': 'key' },
  timeout: 5000
});
```

### ID Generation

```javascript
const { generateExecutionId, makeIdempotencyKey } = require('qgenutils');

// Generate unique execution ID
const execId = generateExecutionId(); // e.g., "exec_a1b2c3d4"

// Create idempotency key from parts
const key = makeIdempotencyKey('user_123', 'payment', Date.now());
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
const { formatDateTime, ensureProtocol, validateEmail } = require('qgenutils');

// Modern (recommended)
import { formatDateTime, ensureProtocol, validateEmailFormat } from 'qgenutils';
```

### Compatibility Guarantees

- ✅ No breaking changes to existing APIs
- ✅ All legacy functions continue to work
- ✅ Same function signatures and return types
- ✅ Comprehensive error handling maintained
- ✅ Performance characteristics preserved

## Module Architecture

The library is organized into security-focused modules under `lib/utilities/`:

### 🔐 Security Modules
- `security/` - Authentication, API key handling, timing-safe comparisons
- `validation/` - Comprehensive input validation with Zod schemas
- `password/` - OWASP-compliant password hashing and verification
- `middleware/` - Express security middleware (rate limiting, API validation)

### 📡 Network & HTTP Modules  
- `http/` - HTTP configuration, timeouts, retry logic
- `url/` - URL processing, validation, and normalization

### 📊 Data Processing Modules
- `collections/` - Array and object manipulation utilities
- `batch/` - Concurrent batch processing with semaphore control
- `performance/` - Optimization utilities (memoize, throttle, debounce)
- `data-structures/` - Efficient algorithms (Min-heap, etc.)

### ⚙️ Configuration & System Modules
- `config/` - Application configuration builders
- `secure-config/` - Sensitive configuration value handling
- `module-loader/` - Dynamic module loading with caching
- `scheduling/` - Job scheduling and interval management

### 📅 Utility Modules
- `datetime/` - Date and time manipulation
- `string/` - Secure string processing and sanitization
- `file/` - File size and path utilities
- `id-generation/` - Cryptographically secure identifier generation

### 📊 Monitoring Modules
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
