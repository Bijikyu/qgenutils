/**
 * Create a function that safely extracts duration from a timer.
 *
 * PURPOSE: Factory function that creates a bound duration extractor for a
 * specific timer object. Useful when you need to pass a duration getter
 * as a callback or store it for later use.
 *
 * DESIGN: Returns a zero-argument function that captures the timer reference
 * and delegates to safeDurationFromTimer for consistent error handling.
 *
 * @param {object} [timer] - Timer object with optional elapsed() method
 * @param {function} [timer.elapsed] - Function that returns elapsed time in ms
 * @returns {function(): number} Function that returns elapsed time when called
 */

const safeDurationFromTimer = require('./safeDurationFromTimer');

const createSafeDurationExtractor = (timer) => () => safeDurationFromTimer(timer);

module.exports = createSafeDurationExtractor;
