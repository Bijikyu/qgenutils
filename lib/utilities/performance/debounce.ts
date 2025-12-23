/**
 * Debounces function execution until delay passes without calls.
 *
 * PURPOSE: Delays execution until activity stops, ideal for
 * search input, form validation, or window resize handlers.
 *
 * @param fn - Function to debounce
 * @param delay - Milliseconds to wait after last call
 * @returns Debounced function with cancel method
 */
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  pending(): boolean;
}

const debounce = <T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): DebouncedFunction<T> => {
  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function');
  }
  if (typeof delay !== 'number' || delay < 0) {
    throw new TypeError('Expected delay to be a positive number');
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T> | undefined;

  const debounced: DebouncedFunction<T> = function(this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (lastArgs) {
        result = fn.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }, delay);
    
    return result;
  } as DebouncedFunction<T>;

  debounced.cancel = function(): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
      lastThis = null;
    }
  };

  debounced.flush = function(): ReturnType<T> | undefined {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      if (lastArgs) {
        result = fn.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }
    return result;
  };

  debounced.pending = function(): boolean {
    return timeoutId !== null;
  };

  return debounced;
};

export default debounce;
