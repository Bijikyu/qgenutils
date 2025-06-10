# AGENTS.md

## VISION

This codebase provides a comprehensive utility library (QGenUtils) designed to solve common Node.js development challenges through a modular, well-tested approach. The project's core intent is to create reusable utilities that handle datetime formatting, HTTP operations, URL manipulation, authentication checks, field validation, and view rendering with robust error handling.

The business rationale centers on reducing code duplication across Node.js projects by providing battle-tested utility functions that handle edge cases, security considerations, and performance optimizations that individual developers might overlook. The modular architecture allows selective importing of specific utilities rather than including an entire heavyweight framework.

Key design philosophy decisions not evident from code structure:
- Fail-closed security model: Authentication and validation functions default to denial when uncertain
- Comprehensive logging strategy using qerrors for production debugging without exposing sensitive information
- Performance-first approach with minimal external dependencies to reduce bundle bloat
- Locale-aware implementations (datetime formatting) for international application support
- Double-negation pattern (!!value) used consistently for strict boolean conversion to prevent truthy/falsy confusion
- Header cleaning strategy removes potentially dangerous headers to prevent request smuggling and injection attacks
- Content-length calculation uses Buffer.byteLength() for accurate UTF-8 byte counting rather than character counting

## FUNCTIONALITY

AI agents working with this codebase should understand these behavioral expectations:

**Error Handling Protocol**: All utility functions must maintain the established error handling pattern - use qerrors for internal logging, provide user-friendly responses via response-utils, and never expose internal implementation details to end users.

**Testing Requirements**: Any new utility functions require both unit tests with comprehensive edge case coverage and integration tests demonstrating real-world usage patterns. Test coverage thresholds are enforced (80% minimum across branches, functions, lines, and statements). Tests must use Jest framework with the existing configuration and follow the established pattern of tests/unit/[module-name].test.js for unit tests and tests/integration/ for integration tests.

**Logging Standards**: Console logging is used for development debugging but should be complemented with qerrors for production error tracking. Log messages must be descriptive enough for troubleshooting without being verbose.

**Security Boundaries**: Authentication utilities assume Passport.js integration patterns and access the global passport object's internal _strategies registry. URL utilities sanitize inputs to prevent injection attacks using protocol validation and normalization. Validation functions treat all external input as potentially malicious and use fail-closed approaches. HTTP utilities strip dangerous headers (host, x-target-url, cf-ray, etc.) to prevent header injection and request smuggling attacks.

## SCOPE

**In-Scope**:
- Utility functions for common Node.js/Express development patterns
- Server-side authentication and validation helpers
- HTTP request/response manipulation utilities
- Error handling and logging infrastructure
- Template rendering assistance for server-side applications

**Out-of-Scope**:
- Frontend/client-side JavaScript utilities
- Database ORM or direct database manipulation
- Real-time communication (WebSocket, Socket.io)
- File system operations beyond basic path handling
- Third-party API integration beyond authentication strategies

**Change Boundaries**:
- New utility modules must follow the established pattern of lib/[module-name].js with corresponding test files in tests/unit/ and tests/integration/
- External dependencies require justification for security, maintenance, and bundle size impact - currently limited to qerrors, winston-daily-rotate-file, and @types/node
- Breaking changes to existing utility signatures require deprecation notices and migration paths
- All modules must export through index.js with named exports for selective importing
- Response utilities centralization pattern must be maintained - no duplicate response handling across modules

## CONSTRAINTS

**Protected Components**:
- `package.json` dependencies list - changes require dependency analysis and security audit
- Test configuration files (`tests/jest.config.js`, `tests/setup.js`) - maintain compatibility with existing test infrastructure and coverage thresholds
- Export structure in `index.js` - maintains backward compatibility for existing consumers, use named exports only
- HEADERS_TO_REMOVE constant in http.js - security-critical list of headers that must be stripped from proxied requests
- qerrors integration pattern - all error logging must use this mechanism for consistent error tracking

**Special Processes**:
- New utility functions require REPLITAGENT.md compliance verification including proper commenting and test coverage
- Error handling patterns must be consistent with existing response-utils module - use sendJsonResponse, sendValidationError, sendAuthError, and sendServerError
- All code changes require comprehensive commenting explaining both functionality and rationale following the established pattern
- Console.log statements must include context information and be paired with qerrors for production scenarios
- Template rendering uses EJS patterns with graceful error fallback to prevent blank pages

**Workflow Exceptions**:
- qerrors integration is mandatory for all error scenarios - no bypassing this logging mechanism
- Console.log statements are acceptable for development debugging but should complement, not replace, structured error logging

## POLICY

**Organizational Requirements**:
- All utility functions must be pure or clearly document side effects
- No global state modification outside of error logging
- Thread-safe implementations required for all utilities

**Code Quality Standards**:
- Function documentation must explain not just what code does, but why specific implementation approaches were chosen
- Edge cases and security considerations must be explicitly documented
- Alternative implementation approaches should be noted in comments when relevant

**Dependency Management**:
- External dependencies limited to essential functionality (qerrors, winston-daily-rotate-file)
- No frameworks or large libraries - maintain lightweight utility philosophy
- Regular security audits required for all dependencies

**Testing Standards**:
- Both successful operation and failure scenarios must be tested with comprehensive edge cases
- Integration tests must demonstrate real-world usage patterns including error propagation and module interactions
- Mock objects acceptable for testing but must not mask integration issues - use realistic mock data that matches production patterns
- Test descriptions must be descriptive and use the pattern "verifies should [expected behavior]" 
- Error scenarios must test both the error response and proper qerrors logging
- Coverage reports generated automatically and must meet 80% threshold across all metrics