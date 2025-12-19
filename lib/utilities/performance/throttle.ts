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
const throttle = (fn: any, delay: any): any => {
  let lastCall = 0, timeoutId: any = null, lastArgs: any = null;
  
  return (...args: any): any => {
    const now: any = Date.now();
    lastArgs = args;
    
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
    
    timeoutId && clearTimeout(timeoutId);
    
    timeoutId = setTimeout((): any => {
      lastCall = Date.now();
      fn.apply(this, lastArgs);
      timeoutId = null;
    }, delay - (now - lastCall));
  };
};

export default throttle;
