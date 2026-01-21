# QGenUtils API Documentation

## Overview

QGenUtils provides a comprehensive set of utility APIs for validation, security, collections handling, datetime operations, and performance optimization. This document outlines all available endpoints, their usage, and examples.

## Base URL

```
http://localhost:3000
```

## General Information

- **Content-Type**: `application/json` for all requests
- **Method**: All API endpoints use `POST` method
- **CORS**: Enabled for development
- **Response Format**: JSON

## API Endpoints

### 🔍 Validation Endpoints

#### `/api/validate/email`

Validates email format and structure.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "isValid": true,
  "message": "Valid email format"
}
```

#### `/api/validate/password`

Validates password strength and provides security recommendations.

**Request:**
```json
{
  "password": "MySecureP@ssw0rd123!"
}
```

**Response:**
```json
{
  "strength": 5,
  "score": 1.0,
  "checks": {
    "length": true,
    "uppercase": true,
    "lowercase": true,
    "numbers": true,
    "special": true
  },
  "suggestions": []
}
```

#### `/api/validate/api-key`

Validates API key format according to security standards.

**Request:**
```json
{
  "apiKey": "sk-1234567890abcdefABCDEF"
}
```

**Response:**
```json
{
  "isValid": true,
  "errors": []
}
```

#### `/api/validate/amount`

Validates monetary amount formats.

**Request:**
```json
{
  "amount": "1,234.56"
}
```

**Response:**
```json
{
  "isValid": true,
  "normalized": 1234.56,
  "currency": "USD"
}
```

#### `/api/validate/sanitize`

Sanitizes input strings to prevent XSS and injection attacks.

**Request:**
```json
{
  "input": "<script>alert('xss')</script>"
}
```

**Response:**
```json
{
  "original": "<script>alert('xss')</script>",
  "sanitized": "&lt;script&gt;alert('xss')&lt;/script&gt;"
}
```

---

### 🔒 Security Endpoints

#### `/api/security/mask-api-key`

Masks sensitive API keys for logging/display purposes.

**Request:**
```json
{
  "apiKey": "sk-sensitive1234567890abcdef"
}
```

**Response:**
```json
{
  "original": "sk-sensitive1234567890abcdef",
  "masked": "sk-se****cdef"
}
```

#### `/api/security/hash-password`

Hashes passwords using secure bcrypt hashing.

**Request:**
```json
{
  "password": "MySecureP@ssw0rd"
}
```

**Response:**
```json
{
  "original": "MySecureP@ssw0rd",
  "hashed": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LfUpW"
}
```

#### `/api/security/verify-password`

Verifies a password against its hash.

**Request:**
```json
{
  "password": "MySecureP@ssw0rd",
  "hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LfUpW"
}
```

**Response:**
```json
{
  "valid": true
}
```

#### `/api/security/generate-password`

Generates cryptographically secure passwords.

**Request:**
```json
{
  "options": {
    "length": 16,
    "includeSymbols": true,
    "includeNumbers": true,
    "includeUppercase": true,
    "includeLowercase": true
  }
}
```

**Response:**
```json
{
  "password": "Kj8#mN2$pL9@qR5"
}
```

---

### 📦 Collections Endpoints

#### `/api/collections/group-by`

Groups array elements by a specified key.

**Request:**
```json
{
  "array": [
    {"name": "John", "category": "A"},
    {"name": "Jane", "category": "B"},
    {"name": "Bob", "category": "A"}
  ],
  "key": "category"
}
```

**Response:**
```json
{
  "A": [
    {"name": "John", "category": "A"},
    {"name": "Bob", "category": "A"}
  ],
  "B": [
    {"name": "Jane", "category": "B"}
  ]
}
```

#### `/api/collections/chunk`

Splits array into chunks of specified size.

**Request:**
```json
{
  "array": [1, 2, 3, 4, 5, 6, 7, 8, 9],
  "size": 3
}
```

**Response:**
```json
{
  "result": [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
}
```

#### `/api/collections/unique`

Removes duplicate elements from array.

**Request:**
```json
{
  "array": [1, 2, 2, 3, 4, 4, 5]
}
```

**Response:**
```json
{
  "result": [1, 2, 3, 4, 5]
}
```

#### `/api/collections/sort-by`

Sorts array by object property.

**Request:**
```json
{
  "array": [
    {"name": "John", "age": 30},
    {"name": "Jane", "age": 25},
    {"name": "Bob", "age": 35}
  ],
  "key": "age"
}
```

**Response:**
```json
{
  "result": [
    {"name": "Jane", "age": 25},
    {"name": "John", "age": 30},
    {"name": "Bob", "age": 35}
  ]
}
```

#### `/api/collections/shuffle`

Randomly shuffles array elements.

**Request:**
```json
{
  "array": [1, 2, 3, 4, 5, 6]
}
```

**Response:**
```json
{
  "result": [4, 2, 6, 1, 5, 3]
}
```

---

### 📅 DateTime Endpoints

#### `/api/datetime/add-days`

Adds days to a date.

**Request:**
```json
{
  "days": 7
}
```

**Response:**
```json
{
  "original": "2026-01-07T17:22:00.000Z",
  "futureDate": "2026-01-14T17:22:00.000Z",
  "days": 7
}
```

#### `/api/datetime/format-date`

Formats date according to specified format.

**Request:**
```json
{
  "date": "2026-01-07",
  "format": "long"
}
```

**Response:**
```json
{
  "original": "2026-01-07",
  "formatted": "January 7, 2026"
}
```

#### `/api/datetime/format-duration`

Formats duration between two dates.

**Request:**
```json
{
  "start": "2026-01-01T00:00:00.000Z",
  "end": "2026-01-07T00:00:00.000Z"
}
```

**Response:**
```json
{
  "duration": "6 days"
}
```

---

### ⚡ Performance Endpoints

#### `/api/performance/memoize`

Tests memoization performance.

**Request:**
```json
{
  "value": "test"
}
```

**Response:**
```json
{
  "iterations": 1000,
  "time": 15,
  "memoized": true
}
```

#### `/api/performance/throttle`

Tests function throttling.

**Request:**
```json
{
  "delay": 100
}
```

**Response:**
```json
{
  "test": "throttle",
  "delay": 100,
  "calls": [1641567823456, 1641567823456, 1641567823456, 1641567823456, 1641567823456]
}
```

#### `/api/performance/benchmark`

Runs performance benchmarks for mathematical operations.

**Request:**
```json
{
  "function": "Math.sqrt",
  "iterations": 10000
}
```

**Response:**
```json
{
  "function": "Math.sqrt",
  "iterations": 10000,
  "time": 45,
  "opsPerSecond": 222222
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Common HTTP Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters or malformed request
- `404 Not Found` - Endpoint not found
- `405 Method Not Allowed` - Non-POST method used
- `500 Internal Server Error` - Server-side error

### Error Examples

```json
{
  "error": "Method not allowed"
}
```

```json
{
  "error": "Unknown validation action"
}
```

```json
{
  "error": "Invalid or missing days parameter"
}
```

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Email validation
const response = await fetch('/api/validate/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const result = await response.json();
console.log(result.isValid); // true/false
```

### cURL

```bash
# API key masking
curl -X POST http://localhost:3000/api/security/mask-api-key \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"sk-sensitive1234567890abcdef"}'

# Array grouping
curl -X POST http://localhost:3000/api/collections/group-by \
  -H "Content-Type: application/json" \
  -d '{"array":[{"name":"John","category":"A"}],"key":"category"}'
```

---

## Development Setup

1. **Start the demo server:**
   ```bash
   node examples/simple-demo-server.cjs
   ```

2. **Access the interactive demo:**
   ```
   http://localhost:3000
   ```

3. **Test API endpoints:**
   Use curl, Postman, or the interactive demo interface

---

## Security Considerations

- All inputs are validated and sanitized
- Password operations use bcrypt for secure hashing
- No sensitive data is logged or exposed in error messages
- CORS is enabled for development only
- Request size limits are enforced
- SQL injection and XSS protection is implemented

---

## Rate Limiting

Current implementation includes basic rate limiting for demo purposes:
- 5 requests per minute per IP
- Configurable time windows
- Automatic request cleanup

---

## Contributing

When adding new endpoints:

1. Follow the existing pattern: `POST /api/{category}/{action}`
2. Implement proper input validation
3. Use consistent JSON response format
4. Add comprehensive error handling
5. Update this documentation
6. Add tests for the new endpoints

---

## Support

For issues, questions, or contributions:
- Check the interactive demo at `http://localhost:3000`
- Review the source code in `examples/`
- Consult the main QGenUtils documentation

---

*Last Updated: January 7, 2026*