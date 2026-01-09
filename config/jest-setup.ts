// jest-setup.ts - Jest setup for TypeScript ESM with React support
// Attempt to enable qtests setup if available, but do not hard-require it.
// This avoids configuration errors when the module or file is absent.
try {
  // Use CommonJS require to load side-effectful setup when present.
  // Wrapped to avoid top-level await and to be resilient in non-Node environments.

  // @ts-ignore - require may not be typed in ESM context here
  typeof require === 'function' && require('qtests/setup');
} catch {}
import { jest as jestFromGlobals } from '@jest/globals';

// Set test environment early
process.env.NODE_ENV = 'test';

// Resolve jest reference safely and expose globally for tests using jest.*
const J = (typeof jestFromGlobals !== 'undefined' && jestFromGlobals)
  ? jestFromGlobals
  : (globalThis as any).jest;
if (!(globalThis as any).jest && J) {
  (globalThis as any).jest = J as any;
}

// Provide CommonJS-like require for ESM tests that call require()
// Avoid top-level await to satisfy stricter Jest transform pipelines.
try {
  if (!(globalThis as any).require && typeof require === 'function') {
    (globalThis as any).require = require as any;
  }
} catch {}

beforeAll(() => {
  const j = (globalThis as any).jest || J;
  if (j && typeof j.setTimeout === 'function') {
    j.setTimeout(10000);
  }
});

afterEach(() => {
  const j = (globalThis as any).jest || J;
  if (j && typeof j.clearAllMocks === 'function') {
    j.clearAllMocks();
  }
});
