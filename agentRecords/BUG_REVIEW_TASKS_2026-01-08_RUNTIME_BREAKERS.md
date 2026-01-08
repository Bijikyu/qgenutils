# Bug Review Tasks (Runtime Breakers) — 2026-01-08

Scope: Identify real runtime/build/test breakages (not style). Backward compatibility is not a priority.

## Confirmed Runtime Failures

### 1) Package import fails (`ERR_MODULE_NOT_FOUND`) due to extensionless relative imports in ESM output

- Repro (local build already present in `dist/`):
  - `node -e "import('./dist/index-core.js')"`
- Observed failure:
  - `Error [ERR_MODULE_NOT_FOUND]: Cannot find module .../dist/lib/utilities/helpers/isValidString imported from .../dist/lib/utilities/helpers/index.js`
- Root cause:
  - `dist/lib/utilities/helpers/index.js` imports `./isValidString` (no `.js` extension). Node ESM does not resolve extensionless relative specifiers by default.
  - Source: `lib/utilities/helpers/index.ts` uses extensionless imports (e.g., `import isValidString from './isValidString';`).
- Impact:
  - Any module that imports `../helpers/index.js` becomes a hard runtime failure.
  - This currently breaks the main entry because `dist/index-core.js` re-exports modules that depend on helpers (e.g. `dist/lib/utilities/file/formatFileSize.js` imports `../helpers/index.js`).

**Task P0.1**
- Fix ESM specifiers in helper barrel + helper internals:
  - Update `lib/utilities/helpers/index.ts` to use `.js` in relative imports (e.g., `./isValidString.js`, `./validateRequired.js`, etc.).
  - Update other helper modules that import sibling helper modules without extensions (examples: `lib/utilities/helpers/typeValidators.ts`, `lib/utilities/helpers/jsonFactory.ts`, `lib/utilities/helpers/jsonUtils.ts`, `lib/utilities/helpers/advancedTypeValidators.ts`).
- Validate by re-building and re-running:
  - `node -e "import('./dist/index-core.js').then(()=>console.log('ok'))"`

**Task P0.1b**
- Audit for extensionless relative imports outside helpers that ship to `dist/`:
  - The pattern also exists in other areas (examples: `lib/utilities/module-loader/index.ts`, `lib/utilities/security/index.ts`, `lib/utilities/string/index.ts`, `lib/utilities/http/*.ts`).
  - Even if not currently re-exported from the top-level entrypoints, these files are part of the published output and will fail if imported by path.

### 2) ESM output contains `require()` usage that will throw at runtime (or silently disable features)

These are real runtime bugs because the package is ESM (`package.json#type: "module"`), so `require` is not defined in module scope.

**Task P0.2**
- Remove/replace CommonJS `require()` from modules reachable via exported entrypoints.
- Known reachable examples:
  - `lib/utilities/performance-monitor/createPerformanceMonitor.ts`
    - Top-level `require('./getPerformanceHealthStatus')` and `require('./analyzePerformanceMetrics')` will throw immediately when importing that module.
  - `lib/utilities/performance-monitor/metricCollectionUtils.ts`
    - `require('os').loadavg()` inside `collectMetrics()` will throw when called.
- Fix approach (pick one):
  - Prefer ESM imports: `import { loadavg } from 'os'`, and `import getPerformanceHealthStatus from './getPerformanceHealthStatus.js'`, etc.
  - If dynamic loading is required, use `await import()` (still ESM) or `createRequire(import.meta.url)` explicitly.

## Additional Real Bugs / Logic Errors

### 3) `scheduleOnce().isRunning()` incorrectly reports not-running for “immediate” schedules

- File: `lib/utilities/scheduling/scheduleOnce.ts`
- Current behavior:
  - When `delayMs <= 0`, it uses `setImmediate(executeCallback)` and leaves `timeoutId = null`.
  - `isRunning()` returns `!executed && !cancelled && (timeoutId !== null)`, which is `false` even though the job is pending.
- Impact:
  - Consumers cannot reliably introspect job state for past-due/immediate schedules.

**Task P1.1**
- Track immediate scheduling state:
  - Store `immediateId` from `setImmediate` (and optionally cancel via `clearImmediate`), or track a `scheduled` flag separate from `timeoutId`.
  - Update `isRunning()` to reflect pending immediate jobs.

### 4) `WorkerAsyncLogger` has multiple functional issues (rotation disabled, flush signaling incorrect, uptime incorrect)

- File: `lib/utilities/logging/workerAsyncLogger.ts`
- Bugs:
  - Uses `require('fs/promises')` inside an ESM worker module:
    - `needsRotation()`/`rotateLog()` will not actually stat/rename; rotation becomes a no-op (often silently).
  - Flush/rotate acknowledgements are sent before async operations complete:
    - Worker posts `{ type: 'flushed' }` / `{ type: 'rotated' }` immediately after calling async functions without awaiting.
  - `stats.workerUptime` is corrupted on repeated `stats` requests:
    - It overwrites the start timestamp with a duration, so later calls compute nonsense.
  - Destroy path doesn’t await final flush before `process.exit(0)`, risking log loss.

**Task P1.2**
- Make the worker fully ESM-safe:
  - Replace `require('fs/promises')` usage with ESM imports (`import { stat, rename } from 'fs/promises'`).
  - Await flush/rotate before posting confirmation messages.
  - Track worker start time separately from computed uptime.
  - Await final flush on `destroy` before exiting.

### 5) Conditional exports advertise CommonJS `require` but point to ESM `.js` files

- File: `package.json`
- Current:
  - `exports["."].require` and `exports["./full"].require` both point at `.js` files in an ESM package.
- Impact:
  - `require('qgenutils')` will throw `ERR_REQUIRE_ESM` (or equivalent), despite the package advertising a `require` entry.

**Task P1.3**
- Since backward compatibility is not important:
  - Remove the `require` conditions from `exports` (or point them to actual CJS builds like `.cjs` if you choose to support CJS).

### 6) Multiple auto-generated `*.test.js` files contain invalid JavaScript and will break Jest discovery

- Examples:
  - `tests/index.test.js`
  - `lib/utilities/url/stripProtocol.test.js`
- Symptom:
  - Files contain invalid syntax such as `require(./index.js)` (missing quotes) and are not valid JS programs.
- Why this matters:
  - `tests/jest.config.js` includes `testMatch: ['**/*.test.js', ...]`, so Jest will attempt to parse these and fail.

**Task P2.1**
- Fix one of:
  - Delete/replace these invalid test files with valid Jest tests, or
  - Narrow Jest `testMatch` to exclude co-located invalid tests (e.g., only `**/tests/**/*.test.js`), or
  - Move these generated files out of Jest discovery patterns.

## Suggested Execution Order

1. P0.1 Fix ESM specifiers (import should succeed)
2. P0.2 Remove/replace `require()` in exported runtime paths
3. P1.1 Fix `scheduleOnce().isRunning()` immediate-path logic
4. P1.2 Fix `WorkerAsyncLogger` ESM + correctness issues
5. P1.3 Remove misleading `exports.require` entries
6. P2.1 Fix/disable invalid Jest tests

---

## Resolution Status (2026-01-08)

All items above have been addressed, and `npm test` now passes end-to-end.

### Completed fixes

- ESM import resolution: added explicit `.js` specifiers across the shipped TS sources where needed so `dist/` ESM imports resolve under Node.
- ESM/CJS interop: removed/rewrote `require()` usage in exported runtime paths (HTTP/perf/security/etc) and removed misleading `exports.require` entries from `package.json`.
- Scheduler correctness: fixed `scheduleOnce().isRunning()` for immediate schedules.
- `WorkerAsyncLogger` correctness: removed ESM-unsafe `require`, awaited flush/rotate, fixed uptime tracking, and removed import-time singleton startup hazards.
- Jest reliability: corrected Jest config to actually discover tests, deleted invalid auto-generated test files, and fixed remaining test/runtime mismatches.

### Additional runtime/test issues fixed while iterating

- URL protocol normalization: `ensureProtocol` now returns a structured `{ original, processed, added, error? }` result and avoids adding a trailing `/` when the input had none.
- File size formatting: `formatFileSize` now returns a structured `{ bytes, formatted, unit, size, unitIndex, error? }` result with consistent decimal formatting for KB+.
- Date/time formatting: `formatDate` default fallback is `N/A`; `formatDateTime` now returns a structured result and reports invalid inputs via `error`.
- Rate limiter config compatibility: `createRateLimiter` now accepts `maxRequests` as an alias for `max` (matching usage patterns in the integration tests).
- Logger initialization race: `lib/logger.ts` now ensures the log directory exists synchronously before constructing the rotating file transport, avoiding startup failures when the directory is missing.
- Rate limiter validation correctness: `createRateLimiter` now uses nullish coalescing (`??`) instead of `||` when resolving `windowMs`/`max`, so invalid `0` values are not silently replaced with defaults.
- Protocol param correctness: `ensureProtocol(url, protocol)` now normalizes the provided protocol (e.g. handles `https:` / `https://`) to avoid producing invalid outputs like `https:://`.
- Security rate limiter correctness: `lib/utilities/security/createSecurityRateLimiter.ts` now validates `windowMs`/`maxRequests`/`blockDurationMs` and actually enforces `maxUrlLength` and `maxRequestSize` (via URL length and `Content-Length`) instead of accepting unused options.
