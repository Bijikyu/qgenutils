
# QGenUtils - Utilities Library

A Node.js utility library providing DateTime formatting, HTTP operations, URL processing, collections manipulation, batch processing, and performance utilities. Designed as a lightweight alternative to heavy npm packages with comprehensive error handling.

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

- **DateTime Utilities** - Format dates, calculate durations, relative time
- **HTTP Utilities** - Headers, timeouts, configuration builders
- **URL Utilities** - Protocol handling, URL parsing and normalization
- **Collections** - Array and object manipulation (groupBy, chunk, pick, omit, deepMerge, etc.)
- **Batch Processing** - Concurrency control, retry with backoff
- **Performance** - Memoize, throttle, debounce
- **ID Generation** - Execution IDs, idempotency keys
- **Logging** - Winston logger with daily rotation

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

## Module Architecture

The library is organized into focused modules under `lib/utilities/`:

- `datetime/` - Date and time utilities
- `url/` - URL manipulation functions
- `http/` - HTTP configuration helpers
- `collections/` - Array and object utilities
- `batch/` - Batch processing with concurrency
- `performance/` - Memoize, throttle, debounce
- `id-generation/` - ID and key generation
- `string/` - String manipulation
- `file/` - File utilities
- `config/` - Configuration builders
- `scheduling/` - Interval and job management
- `validation/` - Input validation utilities
- `security/` - Security utilities (rate limiting, API key handling)

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

- `qerrors` - Error tracking and analysis
- `winston-daily-rotate-file` - Logging support
- `@types/node` - TypeScript definitions
- `qtests` - Test utilities

## License

ISC

## Author

Q
