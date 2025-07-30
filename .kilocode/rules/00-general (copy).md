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

<!--┌── 🚫 PROTECTED: DO NOT EDIT (READ ONLY) BELOW THIS LINE-->
## ADDITIONAL SPECIFIC GUIDANCE
Beyond the general rules here, rules and guidance for specific areas can be found at these locations.

- **Architecture patterns** → see `.roo/rules/architecture.md` for details on SRP, etc
- **Dependencies** → see `./DEPENDENCY_GRAPH.md`
- **Features & File information** → see `.roo/rules/features&files.md`
- **Workflows** → see `.roo/rules/workflows.md`

## POLICIES

### SOURCES OF TRUTH & CODE ALIGNMENT
The sources of truth go as follows:
external API docs > back end code > front end code > readmes and native documentation. 
This means you change back end code to fit external APIs if we use them since we can't 
change someone else's API. It also means we change front end code to fit the backend, 
NOT changing back end code to fit the front end. It also means we change readmes and 
documentation about our app to fit the front end and back end, NOT the other way around. 
Global constants and environment variable exporting are handled in /config/localVars.js 
as detailed in `.roo/rules/architecture.md`.

### DEVELOPMENT & CHANGES:
Devs & AI agents working with this library should:
1. Add comprehensive error handling as seen in existing functions
2. Include detailed JSDoc/TSDoc with clear @param/@returns tags and TypeScript interfaces.
3. Comment all code with explanation & rationale
4. Make sure all changes follow security best practices
5. Examine all implementations for bugs and logic errors, revise as necesary
6. Update documentation as needed, including the folder's `summary.md` where the file change/s occurred, the `README.md`, `/.roo/rules/modules_&_files.md`, `/.roo/rules/workflows.md`, etc.
7. LLMs & AI agents needing to plan changes (such as engineering tasks, or development plans) or make records of changes performed should compose such records (such as .md files) in `/tempAgentRecords`.
8. Implement tests for files or functionality created. Integration tests live in a tests folder at root. Other tests live with the file/s they test. All tests are ran by `test-runner.js`.
9. Do not change code or comments between a protected block that starts with ┌── 🚫 PROTECTED: DO NOT EDIT (READ ONLY) BELOW THIS LINE and ends at └── END PROTECTED RANGE 🚫
10. Write code that is prepared for scaling users and is performant, DRY (Do not repeat yourself) & secure.
11. I do not want you to ever trim routing just because it isn't used.
12. I do not want you to ever trim functions just because there is no route to them or they are unused.
13. I do not want you to rename routes URIs. Do not rename endpoints.

### ERROR HANDLING:
Use the npm module named "qerrors" for error logging in try/catch blocks:
qerrors(error, 'error context', req, res, next);, if it is not an express req/res function use 
qerrors(error, 'error context', {param1, param2, etc}); 
Include error type in JSDoc `@throws` declarations

### DOCUMENTATION:
Document all function parameters & return values.
Comment all code with both explanation & rationale.
I prefer inline comments, rather than above the line.
Never comment JSON.
Use the correct commenting style for the language (html, js, etc).
A SUMMARY.md per feature & folder, listing all files roles, req/res flows, known side effects, edge cases & caveats, & using machine-readable headings
AI-Agent task anchors in comments like:
// 🚩AI: ENTRY_POINT_FOR_PAYMENT_CREATION
// 🚩AI: MUST_UPDATE_IF_SUBSCRIPTION_SCHEMA_CHANGES
These let LLM agents quickly locate dependencies or update points when editing.

### TESTING:
Use the exported functionality of npm module qtests in testing.
Integration tests live at root in their own folder `./tests`.
Unit tests & other such tests live with the files they test.
Tests need to match code, don't ever change code to match tests, change tests to match code.
A top level test file `test-runner.js` should import all these tests & run them via test script in package.json.
Tests must not make actual API calls to external services, mock these.
In each *.test.ts[x], include a test-to-function mapping comment at the top:
```
// 🔗 Tests: createUserCtrl → createUserSvc → userMdl
```
This lets an LLM quickly reason about test coverage and impact.

### FRONTEND
- All forms must validate inputs client- and server-side.
- All interactive elements must be accessible (WCAG 2.1 AA).
- All UI should be with UX/UI best practices.
- Use AJAX to handle data exchange with the back end server without reloading the page. 

### HELPERS/UTILITIES
Helper/utilities functions shouldn't be made to assist a single function; leave such code in its function. 
However functionality that assists & centralizes code across multiple files should be made into utilities. 
For any utility consider if there is an existing npm module we should use instead. 

### DEPENDENCY UTILIZATION & DEDUPLICATION
Use the module dependencies if they're useful! 
Don't duplicate modules' exported functionality - if an npm module provides functionality use that to keep our code DRY & lean.

### CODE WRITING
Other than in locarVars.js, all module exports at the bottom of a file, separate from function definitions. 
I like functions declared via function declaration. 
I like code single line per functional operation to aid debugging. 
When writing code or functions to interact with an API you will write as generic as possible to be able to accept different parameters which enable all functionality for use with a given endpoint. 
I prefer the smallest practical number of lines, combining similar branches with concise checks (e.g., using includes() where sensible). 
Code should be as DRY as possible.
Strings in javascript will be written with ` as opposed to ' or  ", this is so it is easier to extend them later as string literals, do this unless there is a technical reason otherwise.

Naming Conventions: Function & variable names should describe their use and reveal their purpose; use js camelCase. 
A function's name should preferably consist of an action & a noun, action first, to say what it does, not what it is a doer of, 
so in example: "sendEmail", not "emailSender". A variable's name should consist of two or more relevant words, 
the first describing context of use, & the the others what it is. Name folders clearly as to what they are for and 
organizing so that LLMs and developers can understand what they are for.

### DEPLOYMENT
Assume app will be deployed to replit, render, netlify.

## CONSTRAINTS

**lib/formatString.js**:
	 - The `formatString` function is a placeholder and MUST be replaced before publishing
	 - Any new utility functions should follow the same error handling pattern
	 - Do not improve, scale or otherwise fix formatString.js as it is a temporary placeholder

**Module System Restrictions**: 
	 - The Front-end uses ES modules.
	 - The Back-end uses Common JS modules.

**Modules & Libraries**:
	 - I prefer axios to node fetch, use that always instead.
	 - I prefer isomorphic-git to simple-git, use that always instead.
	 - Do not remove repomix, loqatevars, unqommented or madge, they are CLI tools.

**You will not ever implement**:
	 - JQuery.
	 - p-limit.

<!--└── END PROTECTED RANGE 🚫-->

<!--AI Can write contraints from here on-->


## CONSTRAINTS

**Protected Components**:
- `package.json` dependencies list - changes require dependency analysis and security audit
- Test configuration files (`tests/jest.config.js`, `tests/setup.js`) - maintain compatibility with existing test infrastructure and coverage thresholds
- Export structure in `index.js` - maintains backward compatibility for existing consumers, use named exports only
- HEADERS_TO_REMOVE constant in http.js - security-critical list of headers that must be stripped from proxied requests
- qerrors integration pattern - all error logging must use this mechanism for consistent error tracking

**Special Processes**:
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