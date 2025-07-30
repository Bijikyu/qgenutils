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
│   ├── file-utils.js       # File operations and formatting utilities
│   ├── worker-pool.js      # Worker thread pool management for CPU-intensive tasks
│   ├── shutdown-utils.js   # Graceful shutdown and resource cleanup management
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
- **Key Functions**: `createBroadcastRegistry()`, `createPaymentBroadcastRegistry()`, `createSocketBroadcastRegistry()`, `validateBroadcastData()`

### Response Utilities (`lib/response-utils.js`)
- **Purpose**: Centralized HTTP response handling
- **Consistency**: Standardized JSON responses and error formats
- **Key Functions**: `sendJsonResponse()`, `sendValidationError()`, `sendAuthError()`

### ID Generation Utilities (`lib/id-generation.js`)
- **Purpose**: Cryptographically secure identifier creation for tracking and data integrity
- **Security Model**: Uses nanoid for collision-resistant random generation with timestamp ordering
- **Key Functions**: `generateExecutionId()`, `generateTaskId()`, `generateSecureId()`, `generateSimpleId()`

### String Sanitization Utilities (`lib/string-utils.js`)
- **Purpose**: Security-first string processing and XSS prevention
- **Security Model**: Fail-closed patterns that remove dangerous content and normalize input
- **Key Functions**: `sanitizeString()`, `sanitizeErrorMessage()`, `sanitizeForHtml()`, `validatePagination()`

### GitHub Validation Utilities (`lib/github-validation.js`)
- **Purpose**: Comprehensive GitHub repository URL validation and processing
- **Security Model**: Strict pattern matching to prevent automation against invalid targets
- **Key Functions**: `validateGitHubUrl()`, `extractGitHubInfo()`, `validateGitHubRepo()`, `validateGitHubUrlDetailed()`

### Advanced Validation Utilities (`lib/advanced-validation.js`)
- **Purpose**: Comprehensive field validation with detailed error reporting
- **Security Model**: Fail-fast validation with sanitization and consistent error messaging
- **Key Functions**: `validateEmail()`, `validateRequired()`, `validateMaxLength()`, `validateSelection()`, `combineValidations()`, `validateObjectId()`

### File Utilities (`lib/file-utils.js`)
- **Purpose**: File operations and formatting for storage management and user interface display
- **Security Model**: Input validation with graceful handling of invalid data types and edge cases
- **Key Functions**: `formatFileSize()` - converts bytes to human-readable format with appropriate units (B, KB, MB, GB)

### Worker Pool Utilities (`lib/worker-pool.js`)
- **Purpose**: Worker thread pool management for CPU-intensive tasks with automatic worker replacement
- **Security Model**: Path validation, resource cleanup, and error isolation to prevent system instability
- **Key Functions**: `createWorkerPool()` - creates managed pool of worker threads with task queuing and lifecycle management

### Shutdown Utilities (`lib/shutdown-utils.js`)
- **Purpose**: Graceful application shutdown and resource cleanup management for server lifecycle
- **Security Model**: Timeout protection, error isolation, and signal validation to prevent unauthorized shutdowns
- **Key Functions**: `createShutdownManager()` - configurable shutdown manager with cleanup handler registry, `gracefulShutdown()` - simple server shutdown

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

- July 22, 2025. Added shutdown utilities module (`lib/shutdown-utils.js`) with `createShutdownManager()` and `gracefulShutdown()` functions for server lifecycle management. Provides configurable shutdown manager with cleanup handler registry, signal-based shutdown handling, timeout protection, and resource cleanup coordination. Includes comprehensive error handling, priority-based handler execution, and graceful degradation patterns. Features extensive test coverage with 22 test cases covering all shutdown scenarios and edge cases.
- July 22, 2025. Added worker pool utilities module (`lib/worker-pool.js`) with `createWorkerPool()` function for managing worker thread pools for CPU-intensive tasks. Includes automatic worker replacement on failure, task queuing system, transferable object support, graceful shutdown, and comprehensive error handling. Provides Promise-based API with configurable pool sizes and robust lifecycle management. Features complete test coverage with mocked worker threads.
- July 22, 2025. Added file utilities module (`lib/file-utils.js`) with `formatFileSize()` function for converting byte values to human-readable file size strings. Includes comprehensive input validation, support for units up to GB, decimal precision handling, and graceful error handling for invalid inputs. Follows established security-first patterns with proper logging and test coverage.
- June 17, 2025. Completed comprehensive validation and utility enhancement with four new modules: **String Sanitization** (`lib/string-utils.js`) providing security-first XSS prevention with `sanitizeString()`, `sanitizeErrorMessage()`, `sanitizeForHtml()`, and `validatePagination()`. **GitHub Validation** (`lib/github-validation.js`) offering strict repository URL validation with `validateGitHubUrl()`, `extractGitHubInfo()`, `validateGitHubRepo()`, and `validateGitHubUrlDetailed()`. **Advanced Validation** (`lib/advanced-validation.js`) delivering comprehensive field validation with `validateEmail()`, `validateRequired()`, `validateMaxLength()`, `validateSelection()`, `combineValidations()`, and `validateObjectId()`. **Enhanced DateTime** utilities expanding existing module with `formatDate()`, `formatDateWithPrefix()`, `formatTimestamp()`, `formatRelativeTime()`, `formatExecutionDuration()`, and `formatCompletionDate()`. All modules follow established security-first patterns, comprehensive error handling, and extensive test coverage. Module now exports 44 functions covering complete application development needs.
- June 17, 2025. Added secure ID generation utilities module (`lib/id-generation.js`) with `generateExecutionId()`, `generateTaskId()`, `generateSecureId()`, and `generateSimpleId()` functions. Provides cryptographically secure identifier creation using nanoid for execution tracking, task management, and data integrity. Includes timestamp-based natural ordering, collision resistance, comprehensive input validation, and extensive test coverage with 400 unique IDs generated without conflicts.
- June 17, 2025. Enhanced datetime utilities module (`lib/datetime.js`) with `addDays()` function for business date arithmetic. Added comprehensive date calculation functionality for credit expiration, billing cycles, and scheduling operations. Includes immutable date patterns, robust error handling, and support for month/year boundary calculations. Maintains 90-day default for credit systems while supporting flexible timeframes.
- June 17, 2025. Added real-time communication utilities module (`lib/realtime.js`) with `createBroadcastRegistry()`, `createPaymentBroadcastRegistry()`, and `validateBroadcastData()` functions. Implements dependency injection pattern for socket.io broadcast function registries to prevent circular dependencies. Includes comprehensive data validation, security checking, and late binding support for real-time applications.
- June 17, 2025. Added browser utilities module (`lib/browser.js`) with `makeCopyFn()`, `isClipboardSupported()`, and `isBrowser()` functions. Factory pattern for clipboard operations with customizable feedback callbacks. Includes environment detection and graceful degradation for server-side compatibility. Enhanced existing clipboard functionality with comprehensive error handling, security validation, and cross-environment support.
- June 17, 2025. Added environment variable utilities module (`lib/env.js`) with `requireEnvVars()`, `hasEnvVar()`, and `getEnvVar()` functions. Includes comprehensive unit tests and integration tests. Follows existing codebase patterns for error handling, logging, and fail-safe behavior.
- June 15, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.

<!-- 
┌── 🚫 PROTECTED: AI AGENTS, DO NOT EDIT BELOW THIS LINE
│   This section is managed by human developers, not Replit Agent.-->
Replit agent is mainly used for MVP & some bug fixes & testing.
Therefore replit.md is often out of date.
For up-to-date rules & directives see AGENTS.md

CRITICAL DEVELOPMENT PRINCIPLE (PERMANENT):
NEVER remove wanted functionality to fix problems - this approach is explicitly forbidden
Always find proper solutions that maintain all intended features and capabilities
Removing features instead of debugging root causes is "not ok" and must be avoided
When facing complex issues, invest time to understand and fix the underlying problem
Maintain feature completeness while resolving technical challenges
NEVER disable middleware or security features - instead fix them to work correctly in 
the deployment environment.

YOU ARE NEVER TO DELETE ANYTHING WITHOUT PERMISSION. DO NOT ASSUME I WANT SOMETHING DELETED, ASK FOR CLARITY.
<!-- 
└── END PROTECTED RANGE 🚫
-->