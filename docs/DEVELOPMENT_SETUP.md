# Development Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd qgenutils

# Install dependencies
npm install

# Build library
npm run build

# Start demo server
npm run start-demo
```

### Development Workflow

#### 1. Code Changes
```bash
# Make changes to source code
vim lib/utilities/your-file.ts

# Build and test
npm run build
npm test

# Test demo functionality
npm run start-demo
```

#### 2. Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration

# Run with coverage
npm run test:coverage

# Performance tests
npm run test:performance
```

#### 3. Demo Server Testing
```bash
# Start demo server
npm run start-demo

# Test API endpoints
curl -X POST http://localhost:3000/api/validate/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test web interface
open http://localhost:3000
```

### Package Development Scripts

```json
{
  "scripts": {
    "build": "tsc && node scripts/copy-config.mjs",
    "build:watch": "tsc --watch",
    "build:prod": "NODE_ENV=production npm run build",
    "test": "node qtests-runner.mjs",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:performance": "node scripts/performance-benchmark.mjs",
    "start-demo": "node examples/simple-demo-server.cjs",
    "start": "NODE_ENV=production node dist/index.js",
    "clean": "rm -rf dist node_modules/.cache",
    "health": "npm run build && npm test",
    "analyze": "npm run build && npm run test:performance && npm run test:coverage"
  }
}
```

### Library Development

#### Adding New Utilities

1. **Create Utility File**
```typescript
// lib/utilities/your-category/yourUtility.ts

export function yourUtility(param: string): string {
  return param.toUpperCase();
}
```

2. **Add Tests**
```typescript
// lib/utilities/your-category/yourUtility.test.ts

import { yourUtility } from './yourUtility';

describe('yourUtility', () => {
  it('should uppercase string', () => {
    expect(yourUtility('hello')).toBe('HELLO');
  });
});
```

3. **Export in Index**
```typescript
// index.ts
export { default as yourUtility } from './lib/utilities/your-category/yourUtility.js';
```

4. **Build and Test**
```bash
npm run build
npm test
```

#### Development Best Practices

1. **TypeScript First**
   - Always write TypeScript with proper types
   - Use interfaces for complex objects
   - Export types alongside implementations

2. **Error Handling**
   - Use consistent error handling patterns
   - Leverage `qerrors` for error tracking
   - Provide meaningful error messages

3. **Security-First**
   - Validate all inputs
   - Sanitize user-provided data
   - Use fail-closed patterns

4. **Performance**
   - Consider performance implications
   - Add performance tests where relevant
   - Use memoization for expensive operations

### Demo Server Development

#### Adding New API Endpoints

1. **Add Route Handler**
```javascript
// examples/simple-demo-server.cjs

function handleYourUtility(req, res, action, body) {
  let result;
  switch (action) {
    case 'process':
      result = QGenUtils.yourUtility(body.input);
      break;
    default:
      result = { error: 'Unknown action' };
  }
  sendJson(res, result);
}
```

2. **Register Route**
```javascript
case 'your-category':
  await handleYourUtility(req, res, action, body);
  break;
```

3. **Update Documentation**
```javascript
console.log('  POST /api/your-category/process - Your utility processing');
```

#### Testing Demo Server

```bash
# Test new endpoint
curl -X POST http://localhost:3000/api/your-category/process \
  -H "Content-Type: application/json" \
  -d '{"input": "test data"}'
```

### Build System

#### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["lib/**/*"],
  "exclude": ["node_modules", "dist", "tests", "examples"]
}
```

#### Package Configuration

```json
// package.json
{
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    }
  },
  "files": ["dist/**/*"],
  "scripts": {
    "prepublishOnly": "npm run build && npm test",
    "prepack": "npm run build"
  }
}
```

### Testing Strategy

#### Test Structure
```
tests/
├── unit/                    # Unit tests for individual functions
├── integration/             # Integration tests for complete workflows
├── fixtures/                # Test data and mock objects
└── helpers/                 # Test utility functions
```

#### Running Tests

```bash
# All tests
npm test

# Specific patterns
npm run test:unit
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Performance Monitoring

#### Built-in Monitoring

```bash
# Performance benchmark
npm run test:performance

# Analysis with coverage
npm run analyze

# Size check
npm run size-check
```

#### Custom Performance Tests

```javascript
// Add to lib/utilities/performance/performanceTests.ts

export function benchmarkUtility(utilityFn, testData) {
  const start = performance.now();
  
  for (let i = 0; i < 1000; i++) {
    utilityFn(testData[i]);
  }
  
  const end = performance.now();
  return end - start;
}
```

### Common Development Issues

#### Build Errors
```bash
# TypeScript errors
npm run build 2>&1 | head -10

# Clear and rebuild
npm run clean
npm run build
```

#### Module Resolution
```bash
# Check module resolution
node -e "console.log(require.resolve('./dist/index.js'))"
```

#### Demo Server Issues
```bash
# Check port availability
lsof -i :3000

# Kill existing server
pkill -f demo-server

# Start with debug
DEBUG=* node examples/simple-demo-server.cjs
```

### Release Process

#### Pre-release Checklist

- [ ] All tests passing: `npm test`
- [ ] Build successful: `npm run build`
- [ ] No TypeScript errors
- [ ] Demo server working
- [ ] Documentation updated
- [ ] Version number updated
- [ ] Changelog updated

#### Publishing

```bash
# Dry run
npm pack --dry-run

# Publish
npm publish

# Post-publish verification
npm info qgenutils
```

### Development Environment

#### VS Code Extensions (Recommended)
- TypeScript and JavaScript Language Features
- Jest Runner
- ES6+ JavaScript/Node
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

#### Environment Variables

```bash
# Development
export NODE_ENV=development
export DEBUG=*

# Testing
export NODE_ENV=test

# Production
export NODE_ENV=production
```

#### Git Configuration

```gitignore
node_modules/
dist/
coverage/
*.log
.env
.DS_Store
```

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript version: `tsc --version`
   - Verify file encodings

2. **Import Errors**
   - Check import paths in TypeScript files
   - Verify built JavaScript files exist
   - Check tsconfig.json include/exclude patterns

3. **Demo Server Issues**
   - Check port availability
   - Verify built library exists
   - Check console for runtime errors

4. **Test Failures**
   - Clear Jest cache: `jest --clearCache`
   - Update snapshots: `jest --updateSnapshot`
   - Run single test file for debugging

#### Getting Help

```bash
# Check project health
npm run health

# Run full analysis
npm run analyze

# Get help with scripts
npm run
```

This setup guide ensures consistent development practices and smooth collaboration workflows.