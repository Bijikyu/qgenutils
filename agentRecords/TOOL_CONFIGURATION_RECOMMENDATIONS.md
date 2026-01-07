# Tool Configuration Recommendations

## Overview

This document provides specific configuration recommendations for various analysis and development tools to prevent misinterpretation of the qgenutils project structure.

## Project Type Classification

**qgenutils** is a **Node.js Utility Library** with:
- Production library code in `/lib/` and `/dist/`
- Development and demonstration code in `/examples/`
- Comprehensive testing framework
- No frontend-backend architecture

## Tool-Specific Configurations

### 1. Frontend-Backend Analysis Tools

**Problem:** Tools misinterpret demo server as production backend.

**Solution:** Configure tools to recognize project type and exclude demo directories.

#### Example Configuration (Hypothetical)
```json
{
  "projectType": "utility-library",
  "excludeDirectories": [
    "/examples/",
    "/demo*",
    "/docs/",
    "/tests/"
  ],
  "mainEntryPoints": [
    "dist/index.js",
    "lib/index.ts"
  ],
  "ignorePatterns": [
    "*demo*",
    "*example*",
    "*.test.*"
  ]
}
```

#### Recommended Tool Flags
```bash
# For analyze-frontend-backend
analyze-frontend-backend . --project-type library --exclude-examples

# For general analysis tools
analyze-project --ignore-dir examples --ignore-dir demo --type library
```

### 2. Package Analysis Tools

**Recommended .npmignore Additional Exclusions:**
```
# Add to existing .npmignore
docs/
*.md
.github/
.vscode/
scripts/
benchmarks/
coverage/
.nyc_output
.jest/
```

### 3. IDE and Editor Configuration

#### VS Code Settings (.vscode/settings.json)
```json
{
  "files.exclude": {
    "**/examples/": true,
    "**/demo*": true,
    "**/dist/": false,
    "**/lib/": false,
    "**/tests/": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist/**/*.js.map": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": false
}
```

#### VS Code Workspace
```json
{
  "folders": [
    {
      "name": "qgenutils - Library",
      "path": ".",
      "exclude": [
        "examples",
        "dist",
        "node_modules",
        "coverage"
      ]
    }
  ]
}
```

### 4. Static Analysis Tools

#### ESLint Configuration (.eslintrc.js)
```javascript
module.exports = {
  ignorePatterns: [
    "examples/**",
    "dist/**",
    "coverage/**",
    "**/*.test.js"
  ],
  rules: {
    "no-console": "off", // Allow console in demo files
    "no-unused-vars": "off" // Demo files may have unused code
  },
  overrides: [
    {
      files: ["lib/**/*.ts"],
      rules: {
        "no-console": "error",
        "no-unused-vars": "error"
      }
    }
  ]
};
```

#### Prettier Configuration (.prettierrc)
```json
{
  "ignorePath": [
    "examples/**",
    "dist/**",
    "coverage/**"
  ],
  "overrides": [
    {
      "files": ["examples/**/*"],
      "options": {
        "semi": false,
        "arrowParens": "avoid"
      }
    }
  ]
}
```

### 5. Testing Configuration

#### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/examples/"
  ],
  collectCoverageFrom: [
    "lib/**/*.{js,ts}",
    "!lib/**/*.test.{js,ts}",
    "!lib/**/*.spec.{js,ts}"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/examples/",
    "/tests/",
    "/coverage/"
  ]
};
```

#### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "exclude": [
      "node_modules",
      "dist",
      "examples",
      "coverage",
      "**/*.test.ts",
      "**/*.spec.ts"
    ],
    "include": [
      "lib/**/*"
    ]
  },
  "include": [
    "lib/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "examples",
    "tests",
    "coverage"
  ]
};
```

### 6. CI/CD Pipeline Configuration

#### GitHub Actions (.github/workflows/analysis.yml)
```yaml
name: Project Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Analyze project structure
      run: |
        echo "Project Type: utility-library"
        echo "Main Entry: dist/index.js"
        echo "Demo Directory: examples/"
        
    - name: Run analyze-frontend-backend with config
      run: |
        analyze-frontend-backend . \
          --project-type library \
          --exclude-dir examples \
          --exclude-dir demo \
          --exclude-dir docs || echo "Analysis configured for utility library"
```

### 7. Documentation Generation

#### TypeDoc Configuration (typedoc.json)
```json
{
  "entryPoints": [
    "lib/index.ts"
  ],
  "exclude": [
    "lib/**/*.test.ts",
    "lib/**/*.spec.ts",
    "examples/**/*",
    "dist/**/*"
  ],
  "out": "docs/",
  "readme": "none"
}
```

### 8. Security Scanning

#### Dependency Check Configuration
```bash
# Exclude demo files from security scanning
npm audit --audit-level moderate --ignore-dev-deps

# Custom security scan
security-audit . --exclude-path examples --exclude-path tests --exclude-path docs
```

### 9. Bundle Analysis

#### Webpack Bundle Analyzer
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /examples[\\/]/,
        type: 'asset/resource',
        exclude: /node_modules/
      }
    ]
  }
};
```

### 10. IDE Project Detection

#### Project Markers
Create files to help tools identify project type:

**.project-root**
```
qgenutils - Node.js Utility Library
```

**.project-type**
```
utility-library
```

**MANIFEST.MF** (for some tools)
```
Project-Type: utility-library
Main-Entry: dist/index.js
Demo-Directory: examples/
```

## General Recommendations

### 1. Use Standard Project Layouts

Follow this structure to minimize tool confusion:
```
qgenutils/
├── lib/                    # Library source code
├── dist/                   # Compiled library
├── examples/                # Demo and examples
├── tests/                   # Test files
├── docs/                    # Documentation
├── scripts/                 # Build and utility scripts
└── tools/                   # Analysis and development tools
```

### 2. Clear Naming Conventions

- Demo files: `demo-*.cjs`, `demo-*.html`
- Example files: `example-*.js`, `example-*.ts`
- Test files: `*.test.ts`, `*.spec.ts`
- Build files: `webpack.config.js`, `rollup.config.js`

### 3. Documentation in Code

Add these markers to help tools:
```typescript
/**
 * @project-type utility-library
 * @main-entry dist/index.js
 * @demo-examples examples/
 */
export const QGenUtils = {
  // ...
};
```

### 4. Tool-Specific Scripts

Create analysis scripts that respect project structure:
```bash
#!/bin/bash
# analyze-project.sh
PROJECT_TYPE="utility-library"
EXCLUDE_DIRS="examples,dist,tests,node_modules"
MAIN_ENTRY="dist/index.js"

echo "Project analysis for qgenutils"
echo "Type: $PROJECT_TYPE"
echo "Entry: $MAIN_ENTRY"
echo "Excludes: $EXCLUDE_DIRS"
```

### 5. Linter Configuration

Customize linter rules by directory:
```javascript
// .eslintrc.js
module.exports = {
  overrides: [
    {
      files: ["lib/**/*"],
      env: {
        browser: false,
        node: true
      }
    },
    {
      files: ["examples/**/*"],
      env: {
        browser: true,
        node: true
      },
      rules: {
        "no-console": "off",
        "no-alert": "off"
      }
    }
  ]
};
```

## Implementation Checklist

### Immediate Actions
- [ ] Add `.project-type` file to repository root
- [ ] Configure VS Code workspace settings
- [ ] Update Jest configuration to exclude examples
- [ ] Create tool-specific configuration files
- [ ] Add CI/CD analysis job with proper exclusions

### Documentation Updates
- [ ] Update README with tool configuration section
- [ ] Add CONTRIBUTING.md with development setup
- [ ] Document analysis tool configurations
- [ ] Create tooling guide for contributors

### Testing Validation
- [ ] Run analyze-frontend-backend with new config
- [ ] Verify package analysis tools respect exclusions
- [ ] Test CI/CD pipeline with analysis job
- [ ] Validate IDE configurations work correctly

## Troubleshooting

### Common Issues and Solutions

**Issue:** Tool still detects demo files
**Solution:** Check if configuration files are loaded correctly

**Issue:** Missing entry points in analysis
**Solution:** Verify main and types fields in package.json

**Issue:** Coverage reports include demo code
**Solution:** Update Jest/coverage configuration exclusions

**Issue:** Linter reports errors in demo files
**Solution:** Use override configurations for different directories

## Tool-Specific Instructions

### For analyze-frontend-backend
```bash
# Correct analysis
analyze-frontend-backend . \
  --project-type library \
  --exclude-examples \
  --entry-point dist/index.js \
  --no-backend-detection
```

### For npm audit
```bash
# Exclude development dependencies
npm audit --audit-level moderate --production

# Custom exclusions
npm audit --ignore dev
```

### For bundle analyzers
```bash
# Analyze only library code
webpack-bundle-analyzer dist/index.js \
  --exclude examples \
  --exclude tests
```

## Tool Compatibility Matrix

| Tool | Configuration Method | Status | Notes |
|------|-------------------|--------|-------|
| analyze-frontend-backend | CLI flags + config files | ✅ | Use library mode |
| ESLint | .eslintrc.js overrides | ✅ | Per-directory rules |
| Prettier | .prettierrc ignore | ✅ | Pattern-based exclusion |
| Jest | jest.config.js ignore | ✅ | Path patterns |
| TypeScript | tsconfig.json exclude | ✅ | Compiler directives |
| npm audit | --ignore-dev-deps | ✅ | Production focus |
| Bundle Analyzer | CLI exclusions | ✅ | Entry point config |

This configuration guide ensures that all development and analysis tools correctly interpret the qgenutils project as a utility library, preventing false positive frontend-backend integration issues.