import safeDurationFromTimer from './safeDurationFromTimer.js';
import createSafeDurationExtractor from './createSafeDurationExtractor.js';
import memoize from './memoize.js';
import throttle, { ThrottleOptions } from './throttle.js';
import debounce, { DebounceOptions } from './debounce.js';

// Export individual utilities with their types
export { safeDurationFromTimer, createSafeDurationExtractor, memoize, throttle, debounce };

// Export types for external use
export type { ThrottleOptions, DebounceOptions };

export default {
  safeDurationFromTimer,
  createSafeDurationExtractor,
  memoize,
  throttle,
  debounce
};
