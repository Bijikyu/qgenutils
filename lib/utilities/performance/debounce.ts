/**
 * Debounces function execution until delay passes without calls.
 *
 * PURPOSE: Delays execution until activity stops, ideal for
 * search input, form validation, or window resize handlers.
 *
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Milliseconds to wait after last call
 * @returns {Function} Debounced function
 */
const debounce = (fn: any, delay: any): any => {
  let timeoutId: any = null;
  
  return (...args: any): any => {
    timeoutId && clearTimeout(timeoutId);
    
    timeoutId = setTimeout((): any => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
};

export default debounce;
