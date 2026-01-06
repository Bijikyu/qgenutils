# Code Deduplication Migration Guide

## Overview

This guide provides comprehensive instructions for migrating to the new centralized utility modules. Following this guide will eliminate code duplication, improve maintainability, and ensure consistent implementation across the codebase.

## New Utility Modules Summary

### Core Utilities (Phase 1)
1. **`/lib/utilities/validation/commonValidation.ts`** - Common validation patterns
2. **`/lib/utilities/error/commonErrorHandling.ts`** - Error handling patterns  
3. **`/lib/utilities/transformation/commonDataTransformation.ts`** - Data transformation patterns

### Extended Utilities (Phase 2)
4. **`/lib/utilities/http/commonHttpResponses.ts`** - HTTP response patterns
5. **`/lib/utilities/security/commonSecurityPatterns.ts`** - Security patterns
6. **`/lib/utilities/config/commonConfigPatterns.ts`** - Configuration patterns
7. **`/lib/utilities/performance/commonPerformancePatterns.ts`** - Performance patterns

### Advanced Utilities (Phase 3)
8. **`/lib/utilities/middleware/commonMiddlewarePatterns.ts`** - Middleware composition
9. **`/lib/utilities/api/commonApiClientPatterns.ts`** - API client patterns
10. **`/lib/utilities/async/commonAsyncPatterns.ts`** - Async utility patterns
11. **`/lib/utilities/cache/commonCachePatterns.ts`** - Caching strategies

## Migration Strategies

### Phase 1: Immediate Adoption (New Development)

#### Rule: All new code MUST use centralized utilities
```typescript
// ✅ CORRECT - Use centralized utility
import { validateType, validateAndTrimString } from '../validation/commonValidation.js';

// ❌ INCORRECT - Duplicate validation logic
if (input == null) {
  throw new Error('Field is required');
}
if (typeof value === 'string') {
  const trimmed = value.trim();
  if (trimmed === '') {
    throw new Error('Value cannot be empty');
  }
}
```

### Phase 2: Gradual Refactoring (Maintenance Windows)

#### Priority Order for Refactoring:
1. **High Priority** - Files with most duplication
   - API Gateway middleware
   - Security validation functions
   - HTTP client configurations
   - Performance monitoring code

2. **Medium Priority** - Moderate duplication
   - Configuration builders
   - Response formatting
   - Error handling patterns

3. **Low Priority** - Minor duplication
   - Simple helper functions
   - Single-use validations

### Phase 3: Automated Enforcement

#### Implement Code Review Rules:
```json
{
  "rules": {
    "no-manual-validation": "error",
    "no-manual-error-handling": "error", 
    "no-duplicated-http-responses": "error",
    "require-centralized-security": "error"
  }
}
```

## Specific Migration Examples

### 1. Validation Pattern Migration

#### Before (Duplicated):
```typescript
// In multiple files across codebase
if (input == null) {
  throw new Error('Field is required');
}

if (typeof value === 'string') {
  const strValue = value.trim();
  if (strValue === '') {
    throw new Error('Value cannot be empty');
  }
  if (strValue.length < minLength) {
    throw new Error(`Value must be at least ${minLength} characters`);
  }
  return strValue;
}

if (typeof value === 'number') {
  if (isNaN(value) || !isFinite(value)) {
    throw new Error('Value must be a valid number');
  }
  return value;
}
```

#### After (Centralized):
```typescript
import { 
  validateAndTrimString, 
  validateNumber,
  validateType 
} from '../validation/commonValidation.js';

const stringValue = validateAndTrimString(input, {
  required: true,
  minLength: 5
});

const numberValue = validateNumber(input, {
  required: true,
  min: 0
});
```

### 2. Error Handling Pattern Migration

#### Before (Duplicated):
```typescript
// In multiple files across codebase
try {
  // operation code
} catch (error) {
  qerrors(error instanceof Error ? error : new Error(String(error)), 'functionName', 'context');
  throw error;
}
```

#### After (Centralized):
```typescript
import { withErrorHandling, handleError } from '../error/commonErrorHandling.js';

// Option 1: Wrap existing function
const safeFunction = withErrorHandling(
  () => { /* operation code */ },
  'functionName',
  'context'
);

// Option 2: Manual error handling
try {
  // operation code
} catch (error) {
  handleError(error, 'functionName', 'context');
}
```

### 3. HTTP Response Pattern Migration

#### Before (Duplicated):
```typescript
// In multiple files across codebase
if (error) {
  return res.status(400).json({
    success: false,
    error: {
      type: 'BAD_REQUEST',
      message: errorMessage
    }
  });
}

return res.status(200).json({
  success: true,
  data: result
});
```

#### After (Centralized):
```typescript
import { ResponseTypes } from '../http/commonHttpResponses.js';

// Error response
return ResponseTypes.badRequest(res, errorMessage);

// Success response
return ResponseTypes.ok(res, result);
```

### 4. Security Pattern Migration

#### Before (Duplicated):
```typescript
// In multiple files across codebase
const ip = req?.ip || req?.socket?.remoteAddress || 'unknown';
const apiKey = req.get('X-API-Key');

if (!apiKey) {
  return res.status(401).json({
    success: false,
    error: {
      type: 'UNAUTHORIZED',
      message: 'Missing API key'
    }
  });
}

// timing-safe comparison
if (apiKey.length !== expectedKey.length) return false;
let result = 0;
for (let i = 0; i < apiKey.length; i++) {
  result |= apiKey.charCodeAt(i) ^ expectedKey.charCodeAt(i);
}
return result === 0;
```

#### After (Centralized):
```typescript
import { 
  extractClientIp, 
  extractApiKey, 
  validateApiKey 
} from '../security/commonSecurityPatterns.js';

const ip = extractClientIp(req);
const apiKey = extractApiKey(req);
const { isValid } = validateApiKey(apiKey, expectedKey);

if (!isValid) {
  return ResponseTypes.unauthorized(res);
}
```

### 5. Configuration Pattern Migration

#### Before (Duplicated):
```typescript
// In multiple files across codebase
const defaultConfig = {
  port: 3000,
  host: 'localhost',
  timeout: 30000
};

const userConfig = { ...defaultConfig };

for (const [key, value] of Object.entries(userConfig)) {
  if (key === 'port' && (value < 1 || value > 65535)) {
    throw new Error('Port must be between 1 and 65535');
  }
  
  if (key === 'host' && typeof value !== 'string') {
    throw new Error('Host must be a string');
  }
}
```

#### After (Centralized):
```typescript
import { 
  mergeConfig, 
  validateConfig, 
  CommonSchemas 
} from '../config/commonConfigPatterns.js';

const defaultConfig = {
  port: 3000,
  host: 'localhost',
  timeout: 30000
};

const schema = {
  port: CommonSchemas.port,
  host: CommonSchemas.host,
  timeout: CommonSchemas.timeout(30000)
};

const config = validateConfig(userConfig, schema);
```

### 6. Performance Pattern Migration

#### Before (Duplicated):
```typescript
// In multiple files across codebase
const startTime = Date.now();

try {
  const result = await operation();
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  if (duration > 5000) {
    console.warn(`Slow operation: took ${duration}ms`);
  }
  
  return result;
} catch (error) {
  const endTime = Date.now();
  const duration = endTime - startTime;
  console.error(`Operation failed after ${duration}ms:`, error);
  throw error;
}
```

#### After (Centralized):
```typescript
import { 
  measureTime, 
  PerformanceTimer,
  checkPerformanceThresholds 
} from '../performance/commonPerformancePatterns.js';

// Option 1: Using measureTime
const { result, duration } = await measureTime('operationName', async () => {
  return await operation();
});

// Option 2: Using PerformanceTimer
const timer = new PerformanceTimer();
timer.start();

try {
  const result = await operation();
  timer.stop();
  
  if (timer.getDuration() > 5000) {
    console.warn(`Slow operation: ${timer.getFormattedDuration()}`);
  }
  
  return result;
} catch (error) {
  timer.stop();
  console.error(`Operation failed after ${timer.getFormattedDuration()}:`, error);
  throw error;
}
```

## File-by-File Migration Checklist

### High Priority Files

#### `/lib/utilities/gateway/apiGateway.ts`
- [ ] Replace manual error handling with `handleError()`
- [ ] Use `ResponseTypes` for all HTTP responses
- [ ] Replace manual request timing with `PerformanceTimer`
- [ ] Use `extractClientIp()` for IP extraction
- [ ] Replace middleware composition with `chainMiddleware()`

#### `/lib/utilities/middleware/createRateLimiter.ts`
- [ ] Use `createRateLimitMiddleware()` from common patterns
- [ ] Replace manual cache logic with `LRUCache` or `TTLCache`
- [ ] Use `withRetry()` for retry logic
- [ ] Use `createErrorResponse()` for error responses

#### `/lib/utilities/http/createAdvancedHttpClient.ts`
- [ ] Replace manual client with `createHttpClient()`
- [ ] Use `withRetry()` for retry logic
- [ ] Use `createApiClient()` for error handling
- [ ] Replace manual timeout logic with `withTimeout()`

#### `/lib/utilities/security/createSecurityMiddleware.ts`
- [ ] Use `extractApiKey()` for API key extraction
- [ ] Use `validateApiKey()` for validation
- [ ] Use `setSecurityHeaders()` for header setting
- [ ] Use `timingSafeCompare()` for comparison

### Medium Priority Files

#### Configuration Files
- [ ] Replace manual merging with `mergeConfig()`
- [ ] Use `validateConfig()` with schemas
- [ ] Use `CommonSchemas` for field definitions
- [ ] Implement caching with `CacheFactory`

#### Performance Files
- [ ] Replace manual timers with `PerformanceTimer`
- [ ] Use `RequestTracker` for request tracking
- [ ] Use `SystemMetricsCollector` for metrics
- [ ] Implement caching with performance data

## Testing and Validation

### Unit Testing
1. **Test New Utilities**: Ensure all new utilities work correctly
2. **Test Migration**: Verify refactored code produces same results
3. **Performance Testing**: Confirm no performance regressions
4. **Integration Testing**: Test in full application context

### Code Review Checklist
- [ ] All imports use centralized utilities
- [ ] No duplicate validation logic
- [ ] No duplicate error handling patterns
- [ ] No duplicate HTTP response patterns
- [ ] No duplicate security patterns
- [ ] TypeScript compilation succeeds
- [ ] Tests pass

## Rollback Plan

If migration introduces issues:

### Immediate Rollback
1. Keep original files until migration is verified
2. Use feature flags to switch between old/new implementations
3. Monitor for errors and performance regressions

### Gradual Rollback
1. Roll back high-priority files first
2. Monitor system stability after each rollback
3. Document issues for future resolution

## Success Metrics

### Quantitative Metrics
- **Lines of Code Reduced**: Target 400+ lines eliminated
- **Duplicate Patterns Eliminated**: Target 12 major patterns
- **Files Refactored**: Target 20+ files updated
- **Build Time**: No significant increase
- **Bundle Size**: 10-15% reduction

### Qualitative Metrics
- **Developer Experience**: Easier to maintain consistent patterns
- **Code Review Quality**: Fewer duplicate patterns to review
- **Bug Fix Impact**: Single point of change for fixes
- **New Feature Development**: Faster development with utilities

## Support and Documentation

### Getting Help
- **Slack Channel**: #code-deduplication
- **Documentation**: `/docs/code-deduplication`
- **Examples**: `/examples/migration-patterns/`
- **Office Hours**: Weekly migration support sessions

### Ongoing Maintenance
- **Monthly Review**: Assess migration progress
- **Utility Updates**: Improve based on feedback
- **Pattern Detection**: Automated detection of remaining duplication
- **Training Sessions**: Regular developer training sessions

## Timeline

### Week 1-2: High Priority Migration
- API Gateway refactoring
- Security middleware updates
- HTTP client modernization

### Week 3-4: Medium Priority Migration  
- Configuration standardization
- Performance monitoring updates
- Response formatting updates

### Week 5-6: Testing and Validation
- Comprehensive testing
- Performance benchmarking
- Documentation updates

### Week 7-8: Cleanup and Documentation
- Remove deprecated code
- Update all documentation
- Team training sessions

This migration guide provides a comprehensive path to eliminate code duplication while maintaining system stability and improving developer experience.