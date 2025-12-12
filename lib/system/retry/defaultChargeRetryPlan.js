/**
 * Generate a default retry plan for charge operations.
 *
 * PURPOSE: Creates a progressive retry plan with increasing delays for
 * handling temporary failures in payment processing and similar operations.
 * The plan uses a base schedule of [0, 24, 72] hours for the first 3 attempts,
 * then extends with 48-hour intervals for additional attempts.
 *
 * DESIGN: Each entry in the returned array contains:
 * - attempt: 1-indexed attempt number
 * - delayMs: milliseconds to wait before this attempt
 *
 * DELAY SCHEDULE:
 * - Attempt 1: 0ms (immediate)
 * - Attempt 2: 24 hours (86,400,000ms)
 * - Attempt 3: 72 hours (259,200,000ms)
 * - Attempt 4+: Previous + 48 hours each
 *
 * @param {number} [maxAttempts=3] - Maximum number of retry attempts
 * @returns {Array<{attempt: number, delayMs: number}>} Retry plan array
 */

function defaultChargeRetryPlan(maxAttempts = 3) {
  const normalizedAttempts = maxAttempts === null || maxAttempts === undefined ? 3 : maxAttempts;

  if (!Number.isInteger(normalizedAttempts) || normalizedAttempts <= 0 || !Number.isFinite(normalizedAttempts)) {
    return [];
  }

  const baseHours = [0, 24, 72];
  const result = [];

  for (let i = 0; i < normalizedAttempts; i++) {
    let hours;
    if (i < baseHours.length) {
      hours = baseHours[i];
    } else {
      hours = baseHours[baseHours.length - 1] + (i - baseHours.length + 1) * 48;
    }

    result.push({
      attempt: i + 1,
      delayMs: hours * 3600 * 1000
    });
  }

  return result;
}

module.exports = defaultChargeRetryPlan;
