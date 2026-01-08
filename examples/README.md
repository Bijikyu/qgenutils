# Demo Server Documentation

## Overview

This repo includes two demo servers:
- `examples/simple-demo-server.cjs` (default via `npm run start-demo`) - lightweight demo with a small set of endpoints
- `examples/demo-server.cjs` - full-featured demo server used for deeper development/testing

**⚠️ Important:** This demo server is **NOT** intended for production use and is excluded from the npm package.

## Features

### 🌐 Interactive Web Interface
- **Comprehensive Testing**: All 100+ utilities accessible via web UI
- **Real-time Results**: See function outputs immediately
- **Parameter Testing**: Test with custom inputs and edge cases
- **Performance Metrics**: Built-in performance monitoring
- **Security Demonstrations**: Safe testing of security features

### 🔌 REST API Endpoints
- **Validation APIs**: Email, password, API key, amount validation
- **Security APIs**: Hashing, masking, sanitization
- **Collection APIs**: Array manipulation and data processing
- **DateTime APIs**: Date formatting and manipulation
- **Performance APIs**: Memoization, throttling, benchmarking

### 📊 Monitoring & Analytics
- **Test Runner**: Automated test suite execution
- **Performance Dashboard**: Real-time system metrics
- **Security Testing**: XSS protection, injection prevention
- **Load Testing**: Concurrent user simulation

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git (to clone repository)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd qgenutils

# Install dependencies
npm install

# Build the library
npm run build

# Start the default (simple) demo server
npm run start-demo
```

To run the full demo server:

```bash
npm run start-full-demo
```

To run the auth example app + UI:

```bash
npm run start-auth-demo
```

## Admin Dashboard

The admin dashboard UI is served as a static page by the demo server:

- Start the demo server: `npm run start-demo`
- Open: `http://localhost:3000/admin-dashboard.html`

### Access Points

Once running, access:

- **Web Interface**: http://localhost:3000
- **API Base URL**: http://localhost:3000/api
- **Static Files**: http://localhost:3000/[filename]

## API Reference

### Validation Endpoints

#### POST /api/validate/email
Validates email address format and structure.

```bash
curl -X POST http://localhost:3000/api/validate/email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response:**
```json
{
  "result": {
    "isValid": true,
    "details": {
      "format": "valid",
      "domain": "example.com"
    }
  }
}
```

#### POST /api/validate/password
Validates password strength and security requirements.

```bash
curl -X POST http://localhost:3000/api/validate/password \
  -H "Content-Type: application/json" \
  -d '{"password": "SecurePass123!"}'
```

**Response:**
```json
{
  "result": {
    "strength": 4,
    "feedback": "Strong password",
    "requirements": {
      "length": true,
      "uppercase": true,
      "lowercase": true,
      "numbers": true,
      "symbols": true
    }
  }
}
```

### Security Endpoints

#### POST /api/security/hash-password
Hashes password using bcrypt with OWASP-compliant settings.

```bash
curl -X POST http://localhost:3000/api/security/hash-password \
  -H "Content-Type: application/json" \
  -d '{"password": "mySecurePassword"}'
```

**Response:**
```json
{
  "result": {
    "original": "mySecurePassword",
    "hashed": "$2b$12$..."
  }
}
```

#### POST /api/security/mask-api-key
Masks API keys for logging/display purposes.

```bash
curl -X POST http://localhost:3000/api/security/mask-api-key \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk-1234567890abcdef"}'
```

**Response:**
```json
{
  "result": {
    "original": "sk-1234567890abcdef",
    "masked": "sk-**************cdef"
  }
}
```

### Collection Endpoints

#### POST /api/collections/group-by
Groups array elements by specified key.

```bash
curl -X POST http://localhost:3000/api/collections/group-by \
  -H "Content-Type: application/json" \
  -d '{
    "array": [
      {"name": "John", "dept": "Engineering"},
      {"name": "Jane", "dept": "Marketing"}
    ],
    "key": "dept"
  }'
```

**Response:**
```json
{
  "result": {
    "Engineering": [{"name": "John", "dept": "Engineering"}],
    "Marketing": [{"name": "Jane", "dept": "Marketing"}]
  }
}
```

### DateTime Endpoints

#### POST /api/datetime/format-date
Formats dates according to specified locale and pattern.

```bash
curl -X POST http://localhost:3000/api/datetime/format-date \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-12-25T10:30:00.000Z",
    "format": "en-US"
  }'
```

**Response:**
```json
{
  "result": {
    "original": "2023-12-25T10:30:00.000Z",
    "formatted": "12/25/2023, 10:30:00 AM"
  }
}
```

### Performance Endpoints

#### POST /api/performance/memoize
Demonstrates memoization performance benefits.

```bash
curl -X POST http://localhost:3000/api/performance/memoize \
  -H "Content-Type: application/json" \
  -d '{"value": "test-data"}'
```

**Response:**
```json
{
  "result": {
    "iterations": 1000,
    "time": 15,
    "memoized": true
  }
}
```

## Web Interface Guide

### Navigation Tabs

The demo interface is organized into functional categories:

- **📊 Overview**: Library statistics and quick tests
- **✅ Validation**: Input validation utilities
- **🔐 Security**: Password hashing, API key masking
- **📦 Collections**: Array and object manipulation
- **⚡ Performance**: Memoization, throttling, benchmarks
- **📅 DateTime**: Date formatting and manipulation
- **🌐 HTTP**: HTTP configuration and testing
- **🔗 URL**: URL processing and validation
- **🧹 String**: String sanitization utilities
- **📁 File**: File size and path utilities
- **⚙️ Config**: Configuration management
- **📈 Monitor**: Performance monitoring
- **🤖 Test Runner**: Automated testing suite

### Using the Interface

1. **Select a tab** for the utility category you want to explore
2. **Enter test data** in the provided input fields
3. **Click action buttons** to execute functions
4. **View results** in the designated result boxes
5. **Experiment with different inputs** to understand behavior

### Test Runner Features

The automated test runner provides:

- **Suite Selection**: Choose specific test categories or run all
- **Performance Monitoring**: Track execution times and memory usage
- **Detailed Reports**: Comprehensive test result analytics
- **Export History**: Save test results for documentation

## Security Considerations

### Demo Server Security

The demo server implements:

- **CORS Protection**: Configurable for development
- **Request Size Limits**: Prevents DoS attacks (1MB default)
- **Input Validation**: All API inputs are validated
- **Error Sanitization**: Prevents information disclosure
- **Security Headers**: CSP, X-Frame-Options, etc.

### Usage Guidelines

- **Development Only**: Not designed for production deployment
- **Local Testing**: Recommended for localhost only
- **Network Isolation**: Avoid exposing to public internet
- **Data Privacy**: Don't use sensitive production data

## Development

### Customization

The demo server can be customized:

```javascript
// Modify port in examples/demo-server.cjs
const port = PORT || 3000;

// Add custom API endpoints
case 'my-custom-feature':
  await handleCustomFeature(req, res, action, method);
  break;

// Update security headers
const cspValue = "default-src 'self'; script-src 'self' 'unsafe-inline'";
```

### Adding New Utilities

To demonstrate new utilities:

1. **Add endpoint handler** in `demo-server.cjs`
2. **Create UI components** in `demo.html`
3. **Add test cases** to test runner
4. **Update documentation**

### Performance Testing

The demo server includes built-in performance testing:

- **Load Testing**: Simulate concurrent users
- **Memory Monitoring**: Track heap usage
- **Response Time Analysis**: Measure latency
- **Benchmarking**: Compare function performance

## Troubleshooting

### Common Issues

**Server won't start:**
```bash
# Check if library is built
npm run build

# Verify dependencies
npm install

# Check port availability
lsof -i :3000
```

**Functions not working:**
```bash
# Rebuild library
npm run clean
npm run build

# Check dist files
ls -la dist/
```

**UI not loading:**
- Verify `demo.html` exists in `examples/`
- Check browser console for errors
- Ensure server is running on correct port

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export NODE_ENV=development

# Or modify demo-server.cjs
const isDevelopment = true;
```

## Contributing

When contributing to the demo server:

1. **Test all changes** with the demo interface
2. **Update API documentation** for new endpoints
3. **Add corresponding UI components** 
4. **Include security considerations**
5. **Test with various input types**

## License

The demo server is part of QGenUtils and licensed under ISC.

---

**Remember:** This is a development tool. For production use, import the library directly into your application:

```javascript
import { validateEmailFormat, hashPassword } from 'qgenutils';
```
