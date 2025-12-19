/**
 * Create a dual-mode function that accepts both spread arguments and object input.
 *
 * PURPOSE: Provides ergonomic calling patterns for functions. The wrapped function
 * can be called with traditional spread arguments OR with a single object parameter.
 * Also adds .fromObject() and .unwrap() methods for explicit usage.
 *
 * DESIGN: Detects call pattern by checking if first argument is a non-array object
 * when only one argument is provided. This heuristic works for most use cases but
 * may need explicit .fromObject() for edge cases.
 *
 * USAGE PATTERNS:
 * const fn = createDualVersionFunction((a, b) => a + b);
 * fn(1, 2);                    // Spread args: returns 3
 * fn({a: 1, b: 2});            // Object (auto-detected, calls fn with object)
 * fn.fromObject({input: ...}); // Explicit object mode
 * fn.unwrap;                   // Access original function
 *
 * @template T
 * @param {T} fn - Function to wrap with dual-mode calling
 * @returns {T & {fromObject: (input: any) => ReturnType<T>, unwrap: T}} Wrapped function
 */

const createDualVersionFunction = (fn) => {
  const dual = (...args) => {
    if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]) && args[0] !== null) {
      return fn(args[0]);
    }
    return fn(...args);
  };

  dual.fromObject = (input) => fn(input);
  dual.unwrap = fn;

  return dual;
};

module.exports = createDualVersionFunction;
