# QGenUtils - Replit Development Guide

## Overview

QGenUtils is a security-first Node.js utility library providing authentication, HTTP operations, URL processing, validation, datetime formatting, and template rendering. It serves as a lightweight alternative to heavy utility libraries, with a focus on fail-closed security patterns and consistent error handling.

## System Architecture

### Core Design Principles
- **Security-First**: Fail-closed patterns where utilities default to secure states on errors
- **Modular Architecture**: Domain-separated modules that operate independently
- **Consistent Error Handling**: Structured logging via qerrors with graceful degradation
- **Performance Optimization**: Lightweight implementation (~15kB vs 500kB+ alternatives)

### Directory Structure
```
QGenUtils/
├── index.js                 # Main entry point and exports
├── lib/                     # Core utility modules
│   ├── auth.js             # Passport.js authentication helpers
│   ├── datetime.js         # Date/time formatting and validation
│   ├── http.js             # HTTP request/response utilities
│   ├── input-validation.js # Type checking and object validation
│   ├── logger.js           # Winston logger configuration
│   ├── response-utils.js   # Standardized HTTP response patterns
│   ├── url.js              # URL manipulation and parsing
│   ├── validation.js       # Field validation and requirement checking
│   └── views.js            # EJS template rendering with error handling
├── tests/                  # Comprehensive test suite
│   ├── unit/               # Individual module tests
│   ├── integration/        # Cross-module interaction tests
│   └── setup.js            # Test environment configuration
└── logs/                   # Winston log files with daily rotation
```

## Key Components

### Authentication Module (`lib/auth.js`)
- **Purpose**: Passport.js integration for authentication status checking
- **Security Model**: Fail-closed - returns `false` when authentication state is uncertain
- **Key Functions**: `checkPassportAuth()`, `hasGithubStrategy()`

### HTTP Utilities (`lib/http.js`)
- **Purpose**: Header cleaning, content-length calculation, response standardization
- **Security Features**: Removes dangerous headers to prevent injection attacks
- **Key Functions**: `calculateContentLength()`, `buildCleanHeaders()`, `getRequiredHeader()`

### URL Processing (`lib/url.js`)
- **Purpose**: URL normalization, protocol enforcement, parsing
- **Security Default**: Automatically adds HTTPS to protocol-less URLs
- **Key Functions**: `ensureProtocol()`, `normalizeUrlOrigin()`, `parseUrlParts()`

### Validation System (`lib/validation.js`)
- **Purpose**: Field presence validation with standardized error responses
- **Pattern**: Fail-fast validation with detailed error reporting
- **Key Functions**: `requireFields()`

### DateTime Utilities (`lib/datetime.js`)
- **Purpose**: Locale-aware date formatting and duration calculations
- **Fallback Strategy**: Returns "N/A" for invalid dates instead of throwing
- **Key Functions**: `formatDateTime()`, `formatDuration()`

### Response Utilities (`lib/response-utils.js`)
- **Purpose**: Centralized HTTP response handling
- **Consistency**: Standardized JSON responses and error formats
- **Key Functions**: `sendJsonResponse()`, `sendValidationError()`, `sendAuthError()`

## Data Flow

### Typical API Request Flow
1. **URL Processing**: `ensureProtocol()` → `normalizeUrlOrigin()`
2. **Authentication**: `checkPassportAuth()` validates user session
3. **Validation**: `requireFields()` checks required parameters
4. **Processing**: Business logic with error handling via qerrors
5. **Response**: Standardized JSON via `sendJsonResponse()`

### Error Handling Pipeline
1. **Error Occurrence**: Any module encounters an error
2. **Logging**: Error logged via qerrors with context
3. **Graceful Degradation**: Safe fallback values returned
4. **User Response**: Generic error messages (never expose internals)

## External Dependencies

### Production Dependencies
- **qerrors** (^1.2.3): Centralized error logging and tracking
- **winston-daily-rotate-file** (^5.0.0): Log rotation and management
- **@types/node** (^22.13.11): TypeScript definitions for Node.js

### Development Dependencies
- **jest** (^29.7.0): Testing framework for unit and integration tests
- **qtests** (^1.0.4): Test utilities and stubbing helpers

### Optional Integrations
- **Passport.js**: Authentication middleware (runtime dependency)
- **Express.js**: Web framework (expected by response utilities)
- **EJS**: Template engine (used by view utilities)

## Deployment Strategy

### Replit Configuration
- **Entry Point**: `index.js`
- **Node Version**: 20.x (via nodejs-20 module)
- **Test Command**: `npm test` (Jest with coverage)
- **Run Command**: `node index.js`

### Environment Setup
- **Logs Directory**: Auto-created at `./logs/` with daily rotation
- **Test Coverage**: 80% threshold for branches, functions, lines, statements
- **Error Logging**: Winston with JSON format for log aggregation

### Production Considerations
- Log files rotate daily and retain 14 days of history
- Console logging disabled in production (use winston transports)
- All utilities handle missing dependencies gracefully
- Fail-closed security patterns prevent unauthorized access

## Changelog

- June 15, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.