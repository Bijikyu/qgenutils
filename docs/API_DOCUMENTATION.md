# QGenUtils API Documentation

**Version:** 1.0.3  
**Type:** Security-First Node.js Utility Library  
**License:** ISC  

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core APIs](#core-apis)
  - [Validation](#validation)
  - [Security](#security)
  - [Performance](#performance)
  - [DateTime](#datetime)
  - [String & URL](#string--url)
  - [File Operations](#file-operations)
  - [Middleware](#middleware)
  - [Configuration](#configuration)
- [Type Definitions](#type-definitions)
- [Performance](#performance)
- [Examples](#examples)
- [Migration Guide](#migration-guide)

## Overview

QGenUtils is a security-first, lightweight utility library for Node.js applications. It provides essential utilities for validation, security, performance optimization, and common operations with fail-closed security patterns.

### Key Features

- 🔒 **Security-First**: All utilities follow fail-closed security patterns
- 🌳 **Tree Shakable**: Import only what you need
- 📝 **TypeScript Support**: Comprehensive type definitions
- ⚡ **High Performance**: Optimized for production use
- 🧪 **Well Tested**: Extensive test coverage
- 📦 **Lightweight**: Minimal dependencies and bundle size

## Installation

```bash
npm install qgenutils
```

### Tree Shakable Imports

```javascript
// Import only what you need
import { validateEmail, hashPassword, memoize } from 'qgenutils';

// Or import everything (not recommended for bundle size)
import QGenUtils from 'qgenutils';
```

## Quick Start

```javascript
import { validateEmail, hashPassword, memoize } from 'qgenutils';

// Email validation
if (validateEmail('user@example.com')) {
  console.log('Valid email!');
}

// Password hashing
const hashedPassword = await hashPassword('mySecurePassword123');

// Performance optimization
const expensiveFunction = memoize((data) => {
  // Expensive computation here
  return processData(data);
});
```

## Core APIs

### Validation

#### `validateEmail(email: string): boolean`

Validates email format using comprehensive regex patterns.

```javascript
import { validateEmail } from 'qgenutils';

validateEmail('user@example.com');     // true
validateEmail('invalid-email');        // false
validateEmail('user@domain.co.uk');   // true
```

#### `validateUrl(url: string): boolean`

Validates URL format using URL constructor.

```javascript
import { validateUrl } from 'qgenutils';

validateUrl('https://example.com');    // true
validateUrl('invalid-url');            // false
validateUrl('ftp://files.example.com'); // true
```

#### `validateNumber(value: any, options?: NumberValidationOptions): number`

Validates and normalizes numeric values.

```javascript
import { validateNumber } from 'qgenutils';

validateNumber('42');                 // 42
validateNumber('invalid');            // throws Error
validateNumber(3.14, { min: 0, max: 10 }); // 3.14
```

#### `validateString(value: any, options?: StringValidationOptions): string`

Validates and sanitizes string values.

```javascript
import { validateString } from 'qgenutils';

validateString('  hello  ');          // 'hello'
validateString(null, { required: true }); // throws Error
validateString('short', { minLength: 3 }); // 'short'
```

#### `validateArray(value: any, options?: ArrayValidationOptions): any[]`

Validates array inputs with optional item validation.

```javascript
import { validateArray } from 'qgenutils';

validateArray([1, 2, 3]);            // [1, 2, 3]
validateArray('not-array');          // throws Error
validateArray([1, 2], { maxLength: 5 }); // [1, 2]
```

### Security

#### `hashPassword(password: string, options?: PasswordOptions): Promise<string>`

Hashes passwords using bcrypt with configurable options.

```javascript
import { hashPassword } from 'qgenutils';

const hashed = await hashPassword('myPassword123');
// Returns bcrypt hash string
```

#### `verifyPassword(password: string, hash: string): Promise<boolean>`

Verifies password against bcrypt hash.

```javascript
import { verifyPassword } from 'qgenutils';

const isValid = await verifyPassword('myPassword123', hashedPassword);
// Returns true or false
```

#### `generateSecurePassword(options?: PasswordOptions): string`

Generates cryptographically secure passwords.

```javascript
import { generateSecurePassword } from 'qgenutils';

generateSecurePassword();                    // Random 12-char password
generateSecurePassword({ length: 16 });     // 16-char password
generateSecurePassword({ includeSymbols: false }); // Alphanumeric only
```

#### `maskApiKey(apiKey: string): ApiKeyMaskResult`

Masks API keys for logging and display purposes.

```javascript
import { maskApiKey } from 'qgenutils';

maskApiKey('sk-1234567890abcdef');
// Returns: { original: 'sk-1234567890abcdef', masked: 'sk-1****cdef' }
```

### Performance

#### `memoize<T>(fn: Function, options?: MemoizeOptions): Function`

Creates memoized version of functions with caching.

```javascript
import { memoize } from 'qgenutils';

const expensiveFunction = memoize((data) => {
  // Expensive computation
  return processData(data);
});

// First call computes result
expensiveFunction(data); // Computed

// Subsequent calls return cached result
expensiveFunction(data); // From cache
```

#### `debounce<T>(fn: Function, delay: number): Function`

Creates debounced version of functions.

```javascript
import { debounce } from 'qgenutils';

const debouncedSearch = debounce((query) => {
  searchAPI(query);
}, 300);

// Only executes after 300ms of inactivity
debouncedSearch('search term');
```

#### `throttle<T>(fn: Function, limit: number): Function`

Creates throttled version of functions.

```javascript
import { throttle } from 'qgenutils';

const throttledScroll = throttle((event) => {
  handleScroll(event);
}, 100);

// Executes at most once per 100ms
throttledScroll(event);
```

#### `createPerformanceMonitor(options?: PerformanceMonitorOptions): PerformanceMonitor`

Creates performance monitoring instance.

```javascript
import { createPerformanceMonitor } from 'qgenutils';

const monitor = createPerformanceMonitor({
  enabled: true,
  samplingRate: 1.0
});

monitor.start('operation');
// ... perform operation
const metrics = monitor.end('operation');
```

### DateTime

#### `formatDateTime(date: string | Date, options?: DateTimeFormatOptions): DateTimeFormatResult`

Formats dates and times with various options.

```javascript
import { formatDateTime } from 'qgenutils';

formatDateTime(new Date());                    // "1/8/2026, 8:30:00 AM"
formatDateTime('2023-12-25', { format: 'date' }); // "12/25/2023"
formatDateTime(date, { format: 'iso' });       // "2023-12-25T10:30:00.000Z"
```

#### `formatDuration(milliseconds: number, options?: DurationFormatOptions): DurationFormatResult`

Formats duration into human-readable strings.

```javascript
import { formatDuration } from 'qgenutils';

formatDuration(1500);                          // "1.50s"
formatDuration(65000, { unit: 'minutes' });    // "1.08m"
formatDuration(86400000);                      // "1.00d"
```

#### `addDays(date: Date, days: number): Date`

Adds days to a date.

```javascript
import { addDays } from 'qgenutils';

const future = addDays(new Date(), 7);
// Returns date 7 days in the future
```

### String & URL

#### `ensureProtocol(url: string, protocol?: string): ProtocolResult`

Ensures URL has proper protocol.

```javascript
import { ensureProtocol } from 'qgenutils';

ensureProtocol('example.com');               // { processed: 'https://example.com', added: true }
ensureProtocol('http://example.com');         // { processed: 'http://example.com', added: false }
ensureProtocol('ftp://files.com', 'ftp');     // { processed: 'ftp://files.com', added: false }
```

#### `normalizeUrlOrigin(url: string): string`

Normalizes URL origin for comparison.

```javascript
import { normalizeUrlOrigin } from 'qgenutils';

normalizeUrlOrigin('https://example.com/path'); // 'https://example.com'
normalizeUrlOrigin('HTTP://EXAMPLE.COM');      // 'http://example.com'
```

#### `stripProtocol(url: string): string`

Removes protocol from URL.

```javascript
import { stripProtocol } from 'qgenutils';

stripProtocol('https://example.com');          // 'example.com'
stripProtocol('ftp://files.example.com');      // 'files.example.com'
```

### File Operations

#### `formatFileSize(bytes: number): FileSizeFormatResult`

Formats file sizes into human-readable strings.

```javascript
import { formatFileSize } from 'qgenutils';

formatFileSize(1024);                         // { formatted: '1.00 KB', unit: 'KB' }
formatFileSize(1048576);                      // { formatted: '1.00 MB', unit: 'MB' }
formatFileSize(1073741824);                  // { formatted: '1.00 GB', unit: 'GB' }
```

### Middleware

#### `createApiKeyValidator(options: ApiKeyValidatorOptions): Middleware`

Creates Express middleware for API key validation.

```javascript
import { createApiKeyValidator } from 'qgenutils';

const apiKeyValidator = createApiKeyValidator({
  apiKey: process.env.API_KEY,
  headerName: 'x-api-key'
});

app.use('/api', apiKeyValidator);
```

#### `createRateLimiter(options: RateLimiterOptions): Middleware`

Creates Express middleware for rate limiting.

```javascript
import { createRateLimiter } from 'qgenutils';

const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
});

app.use(rateLimiter);
```

### Configuration

#### `buildFeatureConfig(config: FeatureConfig): FeatureConfig`

Builds feature flag configuration.

```javascript
import { buildFeatureConfig } from 'qgenutils';

const featureConfig = buildFeatureConfig({
  name: 'new-feature',
  enabled: true,
  rolloutPercentage: 50
});
```

#### `buildSecurityConfig(config: SecurityConfig): SecurityConfig`

Builds security configuration.

```javascript
import { buildSecurityConfig } from 'qgenutils';

const securityConfig = buildSecurityConfig({
  encryption: { enabled: true },
  authentication: { sessionTimeout: 3600000 }
});
```

## Type Definitions

### Core Types

```typescript
// API Response
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Validation Result
interface ValidationResult {
  isValid: boolean;
  message?: string;
  data?: any;
}

// Performance Metrics
interface PerformanceMetrics {
  timestamp: number;
  duration: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
  };
}
```

### Error Codes

```typescript
enum ErrorCodes {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_EMAIL = 'INVALID_EMAIL',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

## Performance

### Benchmarks

All utilities have been benchmarked for performance:

- **Email Validation**: 2.9M ops/sec
- **Password Hashing**: 50K ops/sec (bcrypt limited)
- **Memoization**: 2.6M ops/sec
- **Date Formatting**: 367K ops/sec
- **URL Processing**: 5.2M ops/sec

### Memory Usage

- **Base Memory**: ~4MB
- **Cache Overhead**: Minimal with LRU eviction
- **Memory Reclaim**: >90% with proper cleanup

## Examples

### Complete Authentication Flow

```javascript
import { 
  validateEmail, 
  hashPassword, 
  verifyPassword,
  createApiKeyValidator,
  createRateLimiter 
} from 'qgenutils';

// Input validation
function validateRegistration(data) {
  if (!validateEmail(data.email)) {
    throw new Error('Invalid email format');
  }
  
  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  return true;
}

// Password handling
async function registerUser(userData) {
  validateRegistration(userData);
  
  const hashedPassword = await hashPassword(userData.password);
  
  // Store user with hashed password
  return await User.create({
    ...userData,
    password: hashedPassword
  });
}

// Middleware setup
app.use('/api', createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100
}));

app.use('/api/secure', createApiKeyValidator({
  apiKey: process.env.API_KEY
}));
```

### Performance Optimization

```javascript
import { memoize, debounce, createPerformanceMonitor } from 'qgenutils';

// Memoize expensive operations
const getUserById = memoize(async (id) => {
  return await User.findById(id);
});

// Debounce search
const searchUsers = debounce(async (query) => {
  return await User.search({ query });
}, 300);

// Performance monitoring
const monitor = createPerformanceMonitor();

app.use((req, res, next) => {
  monitor.start(req.path);
  next();
});

app.use((req, res, next) => {
  const metrics = monitor.end(req.path);
  res.set('X-Response-Time', `${metrics.duration}ms`);
  next();
});
```

## Migration Guide

### From v1.0.2 to v1.0.3

#### Tree Shakable Imports

Old way (imports everything):
```javascript
import QGenUtils from 'qgenutils';
const email = QGenUtils.validateEmail('test@example.com');
```

New way (tree shakable):
```javascript
import { validateEmail } from 'qgenutils';
const email = validateEmail('test@example.com');
```

#### Full Library Import

If you need the full library:
```javascript
import QGenUtils from 'qgenutils/full';
```

#### Breaking Changes

- Removed enterprise modules (scaling, caching, chaos, etc.)
- Simplified middleware exports
- Improved type definitions

## Support

- **Documentation**: [https://qgenutils.dev](https://qgenutils.dev)
- **Issues**: [GitHub Issues](https://github.com/qgenutils/qgenutils/issues)
- **Discussions**: [GitHub Discussions](https://github.com/qgenutils/qgenutils/discussions)

## License

ISC License - see LICENSE file for details.