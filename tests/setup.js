// No-op Jest setup for environments without a full src/app implementation.
// This prevents test runners from attempting to start an application server
// during unit tests that only exercise library code.
beforeAll(() => {
  // Intentionally empty: avoid starting servers in test environment
});

afterAll(() => {
  // Intentionally empty: cleanup is not required here
});