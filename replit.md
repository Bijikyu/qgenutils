# QGenUtils - Replit Development Guide

<!--AI Can write above this line-->

<!--┌── 🚫 PROTECTED: DO NOT EDIT (READ ONLY) BELOW THIS LINE-->
For comprehensive agent development rules and guidelines, please refer to the documentation 
located at `node_modules/commoncontext/00-AGENTS.md`. This file contains detailed instructions 
for agent behavior, CLI tool usage, coding standards, and workflow procedures that should be followed 
throughout the development process.

Additional project-specific guidance can be found in:
- `node_modules/npmcontext/01-STACK_RULES.md` - NPM & JavaScript development rules and policies
- `node_modules/npmcontext/02-NPM_architecture.md` - Architecture patterns and Single Responsibility Principle guidelines

While replit.md is the source of truth for replit agent, it often becomes out of date, 
with these being the maintained rules files. Check these for up to date information and 
copy their guidance to replit.md.
<!--└── END PROTECTED RANGE 🚫-->

<!--AI Can write from here on below-->

## Overview
QGenUtils is a security-first Node.js utility library designed as a lightweight alternative to larger libraries. It provides essential functionalities like authentication, HTTP operations, URL processing, validation, datetime formatting, and template rendering. Its core purpose is to offer robust, fail-closed security patterns and consistent error handling across various utilities, aiming for maximum maintainability, testability, and code clarity.

## User Preferences
Preferred communication style: Simple, everyday language.
Replit agent is mainly used for MVP & some bug fixes & testing.
YOU ARE NEVER TO DELETE ANYTHING WITHOUT PERMISSION. DO NOT ASSUME I WANT SOMETHING DELETED, ASK FOR CLARITY.

## Recent Changes
- January 2025: Removed `lib/client/` directory and associated utilities (renderView, makeCopyFn) as functionality moved elsewhere
- Library reorganized from individual category folders to superset groupings for better organization
- Flattened `lib/validation/` structure - moved all validation files directly into validation directory (removed subfolders)
- Moved unit tests to be co-located with source files instead of centralized `tests/unit/` directory
- Improved internal consistency: Updated utilities to use their own validation functions (`isValidString`, `isValidObject`) instead of manual type checks
- **August 19, 2025**: Enhanced self-usage of utilities within the module:
  - Created shared `isValidDate` utility in `lib/validation/isValidDate.js` to eliminate code duplication
  - Updated all datetime utilities (`formatDateTime`, `formatDate`, `formatDuration`, `formatDateWithPrefix`) to use shared `isValidDate` instead of duplicate implementations
  - Fixed manual type checking in `requireFields.js` to use `isValidObject` utility consistently
  - Added `isValidDate` to main exports in `index.js` for external use
  - Created comprehensive test suite for `isValidDate` utility

## System Architecture
QGenUtils is built on a pure Single Responsibility Principle (SRP) architecture, where each function resides in its own file. Key design principles include:
- **Security-First**: Utilities default to secure states on errors (fail-closed patterns).
- **Modular Architecture**: Domain-separated modules operate independently.
- **Consistent Error Handling**: Structured logging via `qerrors` with graceful degradation.
- **Performance Optimization**: Lightweight implementation.
- **Directory Structure**: Organized with a `lib/` directory using superset categories:
  - `validation/` - All validation-related utilities (flattened structure)
  - `utilities/` (string/, file/, url/, datetime/, id-generation/) - General-purpose utility functions
  - `system/` (env/, shutdown/, worker-pool/, realtime/) - System and infrastructure management
  - `security/` (auth/) - Authentication and security utilities
- **UI/UX Decisions**: Not applicable as this is a backend utility library.
- **Technical Implementations**: Node.js based, leveraging SRP for maintainability.
- **Feature Specifications**:
    - **Authentication**: Passport.js integration, fail-closed.

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