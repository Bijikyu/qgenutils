/**
 * Create a time provider for dependency injection.
 *
 * PURPOSE: Enables deterministic datetime behavior by allowing injection
 * of a custom time source. Essential for testing time-dependent logic
 * without flaky tests or mocking Date globally.
 *
 * USAGE:
 * - Production: createTimeProvider() uses real system time
 * - Testing: createTimeProvider(() => new Date('2024-01-15T10:00:00Z'))
 *
 * @param {function(): Date} [getNow] - Function returning current time (defaults to () => new Date())
 * @returns {{now: function(): Date, timestamp: function(): number, isoString: function(): string}}
 */

function createTimeProvider(getNow) {
  const getTime: any = typeof getNow === 'function' ? getNow : () => new Date();

  return {
    now: () => getTime(),
    timestamp: () => getTime().getTime(),
    isoString: () => getTime().toISOString()
  };
}

export default createTimeProvider;
