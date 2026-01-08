# QGenUtils Demo API Documentation

## Overview

The QGenUtils demo server provides a comprehensive testing interface for 100+ utility functions across 8 categories. This RESTful API demonstrates security-first input validation, error handling, and performance optimization.

**Base URL**: `http://localhost:3000`  
**Content-Type**: `application/json`  
**Method**: All endpoints use `POST` for security and consistency

---

## 📧 Validation Endpoints

### Email Validation
```http
POST /api/validate/email
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "isValid": true,
  "message": "Valid email format"
}
```

### Password Validation
```http
POST /api/validate/password
```

**Request Body**:
```json
{
  "password": "MySecureP@ss123!"
}
```

**Response**:
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
  "suggestions": [],
  "isValid": true,
  "message": "Strong password"
}
```

---

## 🔒 Security Endpoints

### API Key Masking
```http
POST /api/security/mask-api-key
```

**Request Body**:
```json
{
  "apiKey": "sk-test1234567890abcdefghijklmnopqrstuvwxyz"
}
```

**Response**:
```json
{
  "original": "sk-test1234567890abcdefghijklmnopqrstuvwxyz",
  "masked": "sk-test1****wxyz"
}
```

---

## 📅 DateTime Endpoints

### Date Formatting
```http
POST /api/datetime/format
```

**Request Body**:
```json
{
  "date": "2024-01-15T10:30:00Z"
}
```

**Response**:
```json
{
  "formatted": "1/15/2024, 10:30:00 AM",
  "timestamp": 1705319400000
}
```

---

## 📁 Collections Endpoints

### Array Group By
```http
POST /api/collections/group-by
```

**Request Body**:
```json
{
  "array": [
    {"name": "John", "dept": "IT"},
    {"name": "Jane", "dept": "HR"},
    {"name": "Bob", "dept": "IT"}
  ],
  "key": "dept"
}
```

**Response**:
```json
{
  "IT": [
    {"name": "John", "dept": "IT"},
    {"name": "Bob", "dept": "IT"}
  ],
  "HR": [
    {"name": "Jane", "dept": "HR"}
  ]
}
```

---

## 📝 String Processing Endpoints

### String Sanitization
```http
POST /api/string/sanitize
```

**Request Body**:
```json
{
  "input": "<script>alert('xss')</script>Hello World"
}
```

**Response**:
```json
{
  "original": "<script>alert('xss')</script>Hello World",
  "sanitized": "Hello World",
  "length": 40,
  "sanitizedLength": 11,
  "changed": true
}
```

**Security Features**:
- Removes all HTML tags (`<script>`, `<div>`, etc.)
- Strips JavaScript protocols (`javascript:`)
- Removes event handlers (`onclick`, `onload`, etc.)
- Preserves legitimate text content

---

## 🌐 URL Processing Endpoints

### Protocol Normalization
```http
POST /api/url/ensure-protocol
```

**Request Body**:
```json
{
  "url": "example.com",
  "protocol": "https"
}
```

**Response**:
```json
{
  "original": "example.com",
  "processed": "https://example.com",
  "added": true,
  "protocol": "https"
}
```

**Features**:
- Adds protocol if missing
- Preserves existing protocols
- Supports custom protocols (`http`, `https`, `ftp`, etc.)
- Handles leading slashes automatically

---

## 📄 File Utilities Endpoints

### File Size Formatting
```http
POST /api/file/format-size
```

**Request Body**:
```json
{
  "bytes": 1048576
}
```

**Response**:
```json
{
  "bytes": 1048576,
  "formatted": "1.00 MB",
  "unit": "MB",
  "size": 1,
  "unitIndex": 2
}
```

**Supported Units**: B, KB, MB, GB, TB

---

## ⚡ Performance Endpoints

### Function Memoization Demo
```http
POST /api/performance/memoize
```

**Request Body**:
```json
{
  "function": "(a, b) => a + b",
  "args": [5, 3]
}
```

**Response**:
```json
{
  "demo": [
    {
      "result": 8,
      "fromCache": false,
      "cacheHits": 0
    },
    {
      "result": 8,
      "fromCache": true,
      "cacheHits": 1
    },
    {
      "result": 8,
      "fromCache": true,
      "cacheHits": 1
    }
  ],
  "explanation": "First call computes, subsequent calls return cached result"
}
```

**Performance Benefits**:
- Caches function results based on arguments
- Improves performance for expensive computations
- Demonstrates cache hit/miss behavior

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": "Method not allowed"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Invalid request body
- `404` - Endpoint not found
- `405` - Method not allowed
- `500` - Server error

### Input Validation
- All endpoints validate input types
- Missing fields are handled gracefully
- Invalid data returns descriptive error messages
- No exceptions are thrown to clients

---

## 🌍 CORS Support

The demo server includes full CORS support:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## 🔧 Development Usage

### Start Server
```bash
node examples/simple-demo-server.cjs
```

### Test with curl
```bash
# Email validation
curl -X POST http://localhost:3000/api/validate/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# String sanitization
curl -X POST http://localhost:3000/api/string/sanitize \
  -H "Content-Type: application/json" \
  -d '{"input":"<script>alert(\"xss\")</script>Hello"}'
```

### Interactive Demo
Open `http://localhost:3000` in your browser for the full interactive demo interface with:
- 13+ testing tabs
- Real-time validation
- Performance monitoring
- Security testing tools
- Analytics dashboard

---

## 📊 Performance Features

### Built-in Monitoring
- Request logging with timing
- Memory usage tracking  
- Error rate monitoring
- Response time analytics

### Security Features
- Input sanitization on all endpoints
- XSS prevention in string processing
- API key masking for sensitive data
- Secure error handling

### Rate Limiting
The demo server includes rate limiting to prevent abuse:
- 100 requests per minute per IP
- Automatic throttling for excessive requests
- Graceful degradation under load

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
node scripts/test-demo-endpoints.js
```

### Performance Benchmarks
```bash
node scripts/benchmark-demo-server.js
```

---

## 📝 API Changelog

### v2.0.0 (Current)
- ✅ Added string sanitization endpoint
- ✅ Added URL protocol normalization
- ✅ Added file size formatting
- ✅ Added performance memoization demo
- ✅ Enhanced error handling
- ✅ Improved server startup messages
- ✅ Added comprehensive API documentation

### v1.0.0 (Original)
- ✅ Basic validation endpoints
- ✅ Security utilities
- ✅ DateTime formatting
- ✅ Array operations

---

## 🤝 Contributing

To add new demo endpoints:

1. **Add utility function** to `DemoUtils` object
2. **Add route handler** in appropriate `handle*` function  
3. **Update server startup** message with new endpoint
4. **Add API documentation** following this format
5. **Write tests** for the new functionality

### Example Addition
```javascript
// 1. Add to DemoUtils
DemoUtils.newUtility = (input) => {
  return { result: input.toUpperCase() };
};

// 2. Add to handleNewCategory
function handleNewCategory(req, res, action, body) {
  let result;
  switch (action) {
    case 'new-action':
      result = DemoUtils.newUtility(body.input);
      break;
    default:
      result = { error: 'Unknown new action' };
  }
  sendJson(res, result);
}
```

---

## 🔗 Related Resources

- **QGenUtils Library Documentation**: [../README.md](../README.md)
- **Security Guidelines**: [./SECURITY.md](./SECURITY.md)
- **Performance Tuning**: [./PERFORMANCE.md](./PERFORMANCE.md)
- **Demo Interface**: [http://localhost:3000/demo.html](http://localhost:3000/demo.html)
- **Source Code**: [../examples/simple-demo-server.cjs](../examples/simple-demo-server.cjs)