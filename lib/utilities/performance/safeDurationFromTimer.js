/**
 * Safely extract duration from a timer object.
 *
 * PURPOSE: Provides safe duration extraction from timer objects that may have
 * an elapsed() method. Handles edge cases gracefully by returning 0 when the
 * timer is invalid, missing, or throws an error.
 *
 * DESIGN: Defensive programming approach - never throws, always returns a number.
 * This is essential for performance monitoring where timer extraction should not
 * break the application flow.
 *
 * @param {object} [timer] - Timer object with optional elapsed() method
 * @param {function} [timer.elapsed] - Function that returns elapsed time in ms
 * @returns {number} Elapsed time in milliseconds, or 0 if extraction fails
 */

function safeDurationFromTimer(timer) {
  try {
    return typeof timer?.elapsed === 'function' ? timer.elapsed() : 0;
  } catch {
    return 0;
  }
}

module.exports = safeDurationFromTimer;
