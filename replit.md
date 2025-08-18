# QGenUtils - Replit Development Guide

## Overview
QGenUtils is a security-first Node.js utility library designed as a lightweight alternative to larger libraries. It provides essential functionalities like authentication, HTTP operations, URL processing, validation, datetime formatting, and template rendering. Its core purpose is to offer robust, fail-closed security patterns and consistent error handling across various utilities, aiming for maximum maintainability, testability, and code clarity.

## User Preferences
Preferred communication style: Simple, everyday language.
Replit agent is mainly used for MVP & some bug fixes & testing.
YOU ARE NEVER TO DELETE ANYTHING WITHOUT PERMISSION. DO NOT ASSUME I WANT SOMETHING DELETED, ASK FOR CLARITY.

## System Architecture
QGenUtils is built on a pure Single Responsibility Principle (SRP) architecture, where each function resides in its own file. Key design principles include:
- **Security-First**: Utilities default to secure states on errors (fail-closed patterns).
- **Modular Architecture**: Domain-separated modules operate independently.
- **Consistent Error Handling**: Structured logging via `qerrors` with graceful degradation.
- **Performance Optimization**: Lightweight implementation.
- **Directory Structure**: Organized with a `lib/` directory using superset categories containing specialized subdirectories:
  - `validation/` (basic/, input/, advanced/, github/) - All validation-related utilities
  - `utilities/` (string/, file/, url/, datetime/, id-generation/) - General-purpose utility functions
  - `system/` (env/, shutdown/, worker-pool/, realtime/) - System and infrastructure management
  - `security/` (auth/) - Authentication and security utilities
  - `client/` (browser/, views/) - Client-side and presentation utilities
- **UI/UX Decisions**: Not applicable as this is a backend utility library.
- **Technical Implementations**: Node.js based, leveraging SRP for maintainability.
- **Feature Specifications**:
    - **Authentication**: Passport.js integration, fail-closed.
    - **Browser Utilities**: Client-side functions with graceful degradation for server context.
    - **URL Processing**: Normalization, protocol enforcement (defaults to HTTPS), parsing.
    - **Validation System**: Fail-fast, field presence validation with standardized error responses.
    - **DateTime Utilities**: Locale-aware formatting, duration, business date arithmetic; returns "N/A" for invalid dates.
    - **Environment Utilities**: Environment variable validation and configuration checking; fail-fast at startup.
    - **Real-time Communication**: Socket.io broadcast registries, dependency injection for circular dependency prevention.

    - **ID Generation**: Cryptographically secure identifier creation using `nanoid`.
    - **String Sanitization**: Security-first string processing, XSS prevention, fail-closed.
    - **GitHub Validation**: Strict GitHub repository URL validation.
    - **Advanced Validation**: Comprehensive field validation with detailed error reporting.
    - **File Utilities**: File size formatting, input validation.
    - **Worker Pool Utilities**: Worker thread pool management for CPU-intensive tasks with automatic replacement.
    - **Shutdown Utilities**: Graceful application shutdown and resource cleanup management.
- **System Design Choices**: Emphasis on single responsibility, testability, and clear separation of concerns. Error handling pipeline includes logging via `qerrors`, graceful degradation, and generic error messages for users.

## External Dependencies

### Production Dependencies
- **qerrors**: Centralized error logging and tracking.
- **winston-daily-rotate-file**: Log rotation and management.
- **@types/node**: TypeScript definitions for Node.js.

### Development Dependencies
- **jest**: Testing framework.
- **qtests**: Test utilities and stubbing helpers.

### Optional Integrations (runtime dependencies, not bundled)
- **Passport.js**: Authentication middleware.
- **Express.js**: Web framework.
- **EJS**: Template engine.