# Bug Review Tasks (2026-01-08)

Scope: identify concrete bugs/logic errors that will cause runtime errors, broken scripts, or broken test execution. No stylistic findings included.

## Highest priority (breaks normal usage)

### 1) `require` export path points at ESM files (will throw `ERR_REQUIRE_ESM`)
- Evidence: `package.json:5` sets `"type": "module"`, but `package.json:12` and `package.json:17` map `"require"` to `./dist/*.js`.
- Why this is a real bug: In a `"type": "module"` package, `.js` is ESM. Consumers doing `require('qgenutils')` (or `require('qgenutils/full')`) will fail at runtime.
- Task:
  - Decide whether to support CommonJS at all. If yes, generate true CJS entrypoints (e.g., `dist/index-core.cjs`, `dist/index.cjs`) and point `exports.*.require` to them.
  - If no, remove the `"require"` conditions entirely so consumers get a correct error instead of a misleading mapping.
- References: `package.json:5`, `package.json:12`, `package.json:17`.

### 2) `npm test` reports success but runs 0 tests (false-green CI signal)
- Evidence: `npm test` output shows “Found 77 test file(s)” but ends with “No tests found, exiting with code 0” and “ALL TESTS PASSED … Files: 0”.
- Likely root causes (both are real problems):
  - `qtests-runner.mjs` never considers `tests/jest.config.js` or `jest.config.js`, so Jest runs without the intended config (`qtests-runner.mjs:152`–`159`).
  - `passWithNoTests: true` makes “no tests found” a success even when discovery is wrong (`qtests-runner.mjs:164`).
  - Jest scans `.cache/.bun/...` and hits haste-map collisions; this can abort/short-circuit test discovery while still exiting 0 under `passWithNoTests` (seen in `npm test` output).
- Task:
  - Fix config resolution to include `tests/jest.config.js` and/or `jest.config.js`.
  - Treat “no tests found” as failure by default (remove `passWithNoTests` or gate it behind an env flag).
  - Add Jest ignore patterns for `.cache/**` (and specifically `.cache/.bun/**`) so test runs are deterministic in this repo.
- References: `qtests-runner.mjs:152`, `qtests-runner.mjs:164`.

### 3) `examples/demo-server.cjs` cannot import local modules under `"type":"module"`
- Evidence:
  - Attempts `require('../lib/index.js')` (`examples/demo-server.cjs:40`) even though `../lib/index.js` is CommonJS code living in a `"type":"module"` package (so it is treated as ESM and `require()` fails).
  - Attempts `require('../config/localVars.js')` (`examples/demo-server.cjs:48`) but `config/localVars.js` is ESM (`export const …`), so `require()` will throw `ERR_REQUIRE_ESM` and crash the demo server.
- Task:
  - Convert `examples/demo-server.cjs` to proper ESM (`.mjs`) and use `import …` consistently, or keep it CJS but switch ESM imports to `await import()` and handle async initialization.
  - Do not rely on a silent `{}` fallback for `QGenUtils` if endpoints are expected to work; fail fast or disable endpoints explicitly when the import fails.
- References: `examples/demo-server.cjs:40`, `examples/demo-server.cjs:48`, `config/localVars.js:16`.

### 4) `browser-utils.js` uses CommonJS `require()` inside an ESM `.js` file
- Evidence: `browser-utils.js:85` calls `require('lodash')`.
- Why this is a real bug: with `"type":"module"`, `require` is undefined in `.js` modules; importing this file will throw immediately. It also won’t work in browsers (no `require` there either).
- Task:
  - Convert to ESM imports (`import _ from 'lodash'`) or remove the lodash dependency for the browser shim.
  - Ensure the file is actually usable in the environments it claims to support (Node ESM vs browser bundle).
- Reference: `browser-utils.js:85`.

## High priority (broken files / immediate runtime failures)

### 5) `scripts/ci-cd.js` is syntactically invalid
- Evidence: `node --check scripts/ci-cd.js` fails; the file contains duplicated identifiers, an unterminated object destructure, and stray markdown/code-fence content (`scripts/ci-cd.js:17`–`51`).
- Task:
  - Either delete this file (if obsolete) or reconstruct it from a known-good source; as-is it cannot be executed or imported.
- Reference: `scripts/ci-cd.js:17`.

### 6) Many `.test.js` files contain invalid JavaScript and/or invalid ESM/CJS interop
- Evidence (invalid JS example): `lib/utilities/config/buildFeatureConfig.test.js:1` contains `require(./buildFeatureConfig)` (missing quotes), which is a syntax error.
- Evidence (interop example): `config/localVars.test.js:1` uses `require('./localVars.js')` to load an ESM module.
- Task:
  - Decide on one test runtime (Jest-in-ESM vs CJS) and regenerate/fix tests consistently.
  - At minimum, fix syntax errors so the test suite can execute and fail meaningfully.
- References: `lib/utilities/config/buildFeatureConfig.test.js:1`, `config/localVars.test.js:1`.

## Medium priority (published runtime hazards)

### 7) ESM output contains extensionless relative imports (will fail in Node ESM)
- Evidence: `dist/lib/utilities/helpers/index.js:52` imports `./isValidString` without a `.js` extension. Node’s ESM resolver will throw `ERR_MODULE_NOT_FOUND` unless run with nonstandard flags.
- Task:
  - Standardize on ESM-safe specifiers (`./isValidString.js`) throughout source so `tsc` emits runnable ESM.
  - Alternatively switch compilation/moduleResolution to a mode that enforces/rewrites correct extensions (and update source accordingly).
- Reference: `dist/lib/utilities/helpers/index.js:52`.

## Notes observed during review (not tasks by themselves)
- `npm test` output includes Jest haste-map collisions under `.cache/.bun/...`, which is inconsistent with “npm only” and should be excluded from test scanning even if the directory remains.

