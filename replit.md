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
│   ├── browser.js          # Client-side browser utilities and clipboard operations
│   ├── env.js              # Environment variable validation and access
│   ├── http.js             # HTTP request/response utilities
│   ├── input-validation.js # Type checking and object validation
│   ├── logger.js           # Winston logger configuration
│   ├── realtime.js         # Socket.io broadcast registries and real-time communication
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

### Browser Utilities (`lib/browser.js`)
- **Purpose**: Client-side browser functionality and clipboard operations
- **Environment Model**: Works in both browser and server contexts with graceful degradation
- **Key Functions**: `makeCopyFn()`, `isClipboardSupported()`, `isBrowser()`

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
- **Purpose**: Locale-aware date formatting, duration calculations, and business date arithmetic
- **Fallback Strategy**: Returns "N/A" for invalid dates instead of throwing
- **Key Functions**: `formatDateTime()`, `formatDuration()`, `addDays()`

### Environment Utilities (`lib/env.js`)
- **Purpose**: Environment variable validation and configuration checking
- **Security Model**: Fail-fast - detect configuration issues at startup
- **Key Functions**: `requireEnvVars()`, `hasEnvVar()`, `getEnvVar()`

### Real-time Communication (`lib/realtime.js`)
- **Purpose**: Socket.io broadcast registries and real-time event management
- **Architecture Model**: Dependency injection pattern to prevent circular dependencies
- **Key Functions**: `createBroadcastRegistry()`, `createPaymentBroadcastRegistry()`, `validateBroadcastData()`

### Response Utilities (`lib/response-utils.js`)
- **Purpose**: Centralized HTTP response handling
- **Consistency**: Standardized JSON responses and error formats
- **Key Functions**: `sendJsonResponse()`, `sendValidationError()`, `sendAuthError()`

## Data Flow

### Typical API Request Flow
1. **Environment Validation**: `requireEnvVars()` checks startup configuration
2. **URL Processing**: `ensureProtocol()` → `normalizeUrlOrigin()`
3. **Authentication**: `checkPassportAuth()` validates user session
4. **Validation**: `requireFields()` checks required parameters
5. **Processing**: Business logic with error handling via qerrors
6. **Response**: Standardized JSON via `sendJsonResponse()`

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

- June 17, 2025. Enhanced datetime utilities module (`lib/datetime.js`) with `addDays()` function for business date arithmetic. Added comprehensive date calculation functionality for credit expiration, billing cycles, and scheduling operations. Includes immutable date patterns, robust error handling, and support for month/year boundary calculations. Maintains 90-day default for credit systems while supporting flexible timeframes.
- June 17, 2025. Added real-time communication utilities module (`lib/realtime.js`) with `createBroadcastRegistry()`, `createPaymentBroadcastRegistry()`, and `validateBroadcastData()` functions. Implements dependency injection pattern for socket.io broadcast function registries to prevent circular dependencies. Includes comprehensive data validation, security checking, and late binding support for real-time applications.
- June 17, 2025. Added browser utilities module (`lib/browser.js`) with `makeCopyFn()`, `isClipboardSupported()`, and `isBrowser()` functions. Factory pattern for clipboard operations with customizable feedback callbacks. Includes environment detection and graceful degradation for server-side compatibility. Enhanced existing clipboard functionality with comprehensive error handling, security validation, and cross-environment support.
- June 17, 2025. Added environment variable utilities module (`lib/env.js`) with `requireEnvVars()`, `hasEnvVar()`, and `getEnvVar()` functions. Includes comprehensive unit tests and integration tests. Follows existing codebase patterns for error handling, logging, and fail-safe behavior.
- June 15, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.