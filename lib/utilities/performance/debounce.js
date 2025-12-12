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
function debounce(fn, delay) {
  let timeoutId = null;
  
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

module.exports = debounce;
