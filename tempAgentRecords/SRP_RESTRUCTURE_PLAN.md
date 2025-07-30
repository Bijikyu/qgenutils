# SRP Architecture Restructure Plan

## Current State Analysis

The current module violates SRP (Single Responsibility Principle) by having multiple functions per file. According to `.roo/rules/architecture.md`, each file should contain exactly one function.

## Current Functions by Module

### lib/auth.js
- checkPassportAuth()
- hasGithubStrategy()

### lib/datetime.js
- formatDateTime()
- formatDuration()
- addDays()
- formatDate()
- formatDateWithPrefix()
- formatTimestamp()
- formatRelativeTime()
- formatExecutionDuration()
- formatCompletionDate()

### lib/http.js
- calculateContentLength()
- buildCleanHeaders()
- getRequiredHeader()

### lib/response-utils.js
- sendJsonResponse()
- sendValidationError()
- sendAuthError()
- sendServerError()

### lib/validation.js
- requireFields()

### lib/url.js
- ensureProtocol()
- normalizeUrlOrigin()
- stripProtocol()
- parseUrlParts()

### lib/views.js
- renderView()
- registerViewRoute()

### lib/env.js
- requireEnvVars()
- hasEnvVar()
- getEnvVar()

### lib/browser.js
- makeCopyFn()
- isClipboardSupported()
- isBrowser()

### lib/realtime.js
- createBroadcastRegistry()
- createPaymentBroadcastRegistry()
- createSocketBroadcastRegistry()
- validateBroadcastData()

### lib/id-generation.js
- generateExecutionId()
- generateTaskId()
- generateSecureId()
- generateSimpleId()

### lib/string-utils.js
- sanitizeString()
- sanitizeErrorMessage()
- sanitizeForHtml()
- validatePagination()

### lib/github-validation.js
- validateGitHubUrl()
- extractGitHubInfo()
- validateGitHubRepo()
- validateGitHubUrlDetailed()

### lib/advanced-validation.js
- validateEmail()
- validateRequired()
- validateMaxLength()
- validateSelection()
- combineValidations()
- validateObjectId()

### lib/file-utils.js
- formatFileSize()

### lib/worker-pool.js
- createWorkerPool()

### lib/shutdown-utils.js
- createShutdownManager()
- gracefulShutdown()

## New SRP Structure

Each function will be moved to its own file under the appropriate domain directory:

```
lib/
├── auth/
│   ├── checkPassportAuth.js
│   └── hasGithubStrategy.js
├── datetime/
│   ├── formatDateTime.js
│   ├── formatDuration.js
│   ├── addDays.js
│   ├── formatDate.js
│   ├── formatDateWithPrefix.js
│   ├── formatTimestamp.js
│   ├── formatRelativeTime.js
│   ├── formatExecutionDuration.js
│   └── formatCompletionDate.js
├── http/
│   ├── calculateContentLength.js
│   ├── buildCleanHeaders.js
│   └── getRequiredHeader.js
├── response/
│   ├── sendJsonResponse.js
│   ├── sendValidationError.js
│   ├── sendAuthError.js
│   └── sendServerError.js
├── validation/
│   └── requireFields.js
├── url/
│   ├── ensureProtocol.js
│   ├── normalizeUrlOrigin.js
│   ├── stripProtocol.js
│   └── parseUrlParts.js
├── views/
│   ├── renderView.js
│   └── registerViewRoute.js
├── env/
│   ├── requireEnvVars.js
│   ├── hasEnvVar.js
│   └── getEnvVar.js
├── browser/
│   ├── makeCopyFn.js
│   ├── isClipboardSupported.js
│   └── isBrowser.js
├── realtime/
│   ├── createBroadcastRegistry.js
│   ├── createPaymentBroadcastRegistry.js
│   ├── createSocketBroadcastRegistry.js
│   └── validateBroadcastData.js
├── id-generation/
│   ├── generateExecutionId.js
│   ├── generateTaskId.js
│   ├── generateSecureId.js
│   └── generateSimpleId.js
├── string-utils/
│   ├── sanitizeString.js
│   ├── sanitizeErrorMessage.js
│   ├── sanitizeForHtml.js
│   └── validatePagination.js
├── github-validation/
│   ├── validateGitHubUrl.js
│   ├── extractGitHubInfo.js
│   ├── validateGitHubRepo.js
│   └── validateGitHubUrlDetailed.js
├── advanced-validation/
│   ├── validateEmail.js
│   ├── validateRequired.js
│   ├── validateMaxLength.js
│   ├── validateSelection.js
│   ├── combineValidations.js
│   └── validateObjectId.js
├── file-utils/
│   └── formatFileSize.js
├── worker-pool/
│   └── createWorkerPool.js
├── shutdown-utils/
│   ├── createShutdownManager.js
│   └── gracefulShutdown.js
└── logger.js (stays as is - single function)
```

## Implementation Steps

1. Create new directory structure
2. Extract each function to its own file with proper JSDoc
3. Update index.js imports to reflect new structure
4. Update test files to import from new locations
5. Backup old structure for reference
6. Verify all tests pass
7. Update documentation

## Benefits of SRP Structure

- **Easier reasoning**: Each file has one clear purpose
- **Better AI-friendliness**: LLMs load only needed code (30 lines vs 500-line blob)
- **Simpler testing**: One test per file
- **Lower coupling**: Changes in one function don't affect others
- **Easier parallel development**: No merge conflicts between functions
- **Better tree-shaking**: Bundlers can optimize more efficiently