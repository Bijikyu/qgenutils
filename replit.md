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

## Agent Development Guidelines (from 00-AGENTS.md)

### CLI Tools & Operations
Use these CLI tools for analysis and planning:
```bash
# AGENTSQRIPTS - Code analysis tools
npx analyze-static-bugs ./      # Detect bug code smells
npx analyze-security ./         # Security vulnerability scan
npx analyze-wet-code ./         # Find duplicate code
npx analyze-performance ./      # Performance bottleneck detection
npx analyze-srp ./             # Check single responsibility violations

# ARQITECT - Planning and problem solving
npx arqitect "Any prompt to fix a code problem"  # Returns detailed plan
npx arqitect --help                              # Show usage

# QUANTUMAGENT - Reasoning and analysis
node node_modules/quantumagent/.bin/cli.js --task "Reasoner: analyze X" --input ./file.txt
```

### Development Policies
- **Sources of Truth**: external API docs > backend code > frontend code > readmes
- **Response Philosophy**: Truth and functionality above all - prefer errors over lies
- **No Mock Data**: Use authentic data only, no fallbacks or defaults that pretend functionality
- **Subagent Integration**: For complex tasks, spawn 3-6 specialized subagents using quantumagent
- **Always Start with Planning**: Use arqitect for initial planning before implementation

### Code Standards
- Always add comprehensive error handling as seen in existing functions
- Always comment all code with explanation & rationale  
- Follow security best practices in all implementations
- Implement tests for all new functionality
- Write performant, DRY, and secure code prepared for scaling

### Error Handling
- Use qerrors module for error logging: `qerrors(error, 'context', {params})`
- Include error types in JSDoc `@throws` declarations
- Implement comprehensive try/catch blocks with structured error reporting

## JavaScript/NPM Stack Rules (from 01-STACK_RULES.md)

### Testing Standards
- Use qtests module for all testing
- Integration tests in `/tests/` folder at root
- Unit tests co-located with source files
- Run tests with: `npm test` or `qtests-runner.js`
- Include test-to-function mapping comments: `// 🔗 Tests: funcA → funcB → funcC`

### Code Writing Standards
- Template literals with backticks (`) for all strings unless technical reason otherwise
- camelCase naming that describes purpose and reveals intent
- Module exports at bottom of file, separate from function definitions
- Use axios over node fetch, isomorphic-git over simple-git
- Never implement jQuery or p-limit

### Dependency Management
- Use existing module dependencies rather than duplicating functionality
- Keep code DRY and lean by leveraging npm modules
- No file duplication for ES/CommonJS compatibility - use smart fixes

## Architecture Patterns (from 02-NPM_architecture.md)

### Single Responsibility Principle (SRP)
- **One function per file** - changes only touch one file
- **Clear naming** with minimal imports/exports
- **Singular public interface** with tight dependencies
- **Simpler testing** - one test per file
- **Lower coupling** - changes don't ripple across modules
- **AI-friendly** - LLMs load only needed code, reducing tokens
- **Parallel editing** - avoids merge conflicts

### Global Constants Management
- All constants in `/config/localVars.js` as single source of truth
- Group by category, don't move or re-categorize existing values
- Export environment variables: `export const envVar = process.env.ENV_VAR`
- Import entire object: `const localVars = require('../config/localVars')`
- Use as: `localVars.variable` (not destructured imports)
- Never edit constants once in localVars.js
- Flag unused with comment "REMOVE?" but don't delete

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
- **August 19, 2025**: Security & Performance Compliance Improvements (00-AGENTS.md compliance):
  - Removed console logging from production code to prevent information disclosure vulnerabilities
  - Enhanced string sanitization with expanded XSS protection (base64 schemes, dangerous attributes, extended protocols)
  - Added comprehensive input sanitization module with HTML/SQL injection prevention and rate limiting
  - Converted synchronous file operations to async in logger initialization for better performance
  - Achieved perfect static analysis score (100/100 Grade A) with zero bugs detected
  - Added security utilities to main exports: `sanitizeHtml`, `sanitizeSqlInput`, `validateInputRate`
  - Maintained excellent code quality metrics with comprehensive error handling and logging
  - **Documentation Updated**: Integrated all guidance from 00-AGENTS.md, 01-STACK_RULES.md, and 02-NPM_architecture.md into replit.md as authoritative source
- **August 19, 2025**: Enhanced Test Compliance & Module Resolution:
  - Fixed Jest configuration by removing non-existent /src directory references
  - Created missing index files for utilities (datetime, url, id-generation, worker-pool, shutdown)
  - Implemented defensive loading for optional dependencies (qerrors, loqatevars, winston-daily-rotate-file)
  - Enhanced error handling with proper mocking in test suites
  - Reduced test failures from 53 to 16 through systematic module resolution fixes
  - Added comprehensive subagent orchestration framework documentation in /agentRecords
  - Maintained perfect static analysis score while improving test infrastructure
- **August 19, 2025**: 01-STACK_RULES.md Compliance Assessment:
  - Assessed compliance with NPM/JavaScript stack rules (85% compliant)
  - Identified areas for improvement: string literals (backticks), test mapping comments
  - Created comprehensive compliance documentation in /agentRecords
  - Enhanced test coverage with proper Jest spy implementations for error validation
  - Maintained core compliance: qtests usage, qerrors error handling, proper module structure

## System Architecture
QGenUtils follows the comprehensive architecture patterns from 02-NPM_architecture.md, built on pure Single Responsibility Principle (SRP) where each function resides in its own file. Key design principles include:

### Core Architecture Principles (SRP Implementation)
- **One Function Per File**: Each file encapsulates one concrete responsibility
- **Minimal Imports/Exports**: Singular public interface with tight dependencies  
- **Clear Naming**: Functions and variables describe their use and reveal purpose
- **Lower Coupling**: Changes in one function never ripple to others
- **AI-Friendly**: LLMs load only 30 lines needed, not 500-line blobs
- **Parallel Development**: Enables LLM editing without merge conflicts

### Security & Quality Standards  
- **Security-First**: Utilities default to secure states on errors (fail-closed patterns)
- **Comprehensive Error Handling**: Structured logging via `qerrors` with graceful degradation
- **Performance Optimization**: Lightweight implementation with async operations
- **Testing Integration**: Uses qtests module with co-located unit tests

### Directory Structure
Organized with a `lib/` directory using superset categories following SRP:
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