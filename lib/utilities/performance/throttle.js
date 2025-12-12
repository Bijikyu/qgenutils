/**
 * Throttles function execution to at most once per delay period.
 *
 * PURPOSE: Rate limits function calls for scroll handlers,
 * resize events, or API calls that shouldn't fire too frequently.
 *
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Minimum milliseconds between calls
 * @returns {Function} Throttled function
 */
function throttle(fn, delay) {
  let lastCall = 0;
  let timeoutId = null;
  let lastArgs = null;
  
  return function(...args) {
    const now = Date.now();
    lastArgs = args;
    
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      lastCall = Date.now();
      fn.apply(this, lastArgs);
      timeoutId = null;
    }, delay - (now - lastCall));
  };
}

module.exports = throttle;
