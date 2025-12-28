/**
 * FUNCTION DEBOUNCING UTILITY
 * 
 * PURPOSE: Delays function execution until a specified delay period passes
 * without any new calls. Essential for optimizing performance when dealing
 * with rapid-fire events that should only trigger once activity stabilizes.
 * 
 * DEBOUNCING VS THROTTLING:
 * - Debouncing: Executes only after N milliseconds of inactivity (final call)
 * - Throttling: Executes at most once every N milliseconds (consistent rate)
 * - Debouncing is ideal for completion events (search, validation, save)
 * - Throttling is better for continuous events (scrolling, animation)
 * 
 * USE CASES:
 * - Search input autocomplete (wait for user to stop typing)
 * - Form validation (validate after user stops typing)
 * - Window resize handlers (recalculate layout after resize complete)
 * - Auto-save functionality (save after user stops editing)
 * - API request batching (group rapid requests into single call)
 * - Button click protection (prevent multiple rapid submissions)
 * - Real-time search suggestions (display after typing pause)
 * 
 * IMPLEMENTATION STRATEGY:
 * - Timer-based delay mechanism with proper cleanup
 * - Latest argument preservation for accurate execution
 * - Context binding for object method compatibility
 * - Memory leak prevention through timeout management
 * - Cancel and flush capabilities for advanced control
 * 
 * PERFORMANCE BENEFITS:
 * - Reduces unnecessary function executions
 * - Improves application responsiveness
 * - Minimizes API calls and server load
 * - Prevents UI lag from excessive processing
 * - Provides smoother user experience
 */

/**
 * Interface for debounced function with management methods.
 */
interface DebouncedFunction<T extends (...args: any[]) => any> {
  /**
   * Execute the debounced function (may be delayed).
   * @param args - Arguments to pass to the original function
   */
  (...args: Parameters<T>): void;
  
  /**
   * Cancel any pending execution and clear the timer.
   */
  cancel(): void;
  
  /**
   * Execute the function immediately if pending, then cancel.
   * @returns The result of the function execution if it was pending
   */
  flush(): ReturnType<T> | undefined;
  
  /**
   * Check if function execution is currently pending.
   * @returns true if execution is scheduled and pending
   */
  pending(): boolean;
}

/**
 * Creates a debounced version of the provided function with management capabilities.
 * 
 * This function delays execution until the specified delay period has passed
 * without any new function calls. It's particularly useful for optimizing
 * performance in scenarios with rapid successive events.
 * 
 * @param fn - The function to debounce. Must be a valid function.
 * @param delay - The delay in milliseconds to wait after the last call before executing.
 * 
 * @returns DebouncedFunction<T> - Debounced version with cancel, flush, and pending methods
 * 
 * @throws {TypeError} - If fn is not a function or delay is not a positive number
 * 
 * @example
 * ```typescript
 * // Search input debouncing
 * const debouncedSearch = debounce(async (query: string) => {
 *   const results = await fetchSearchResults(query);
 *   displayResults(results);
 * }, 300);
 * 
 * searchInput.addEventListener('input', (e) => {
 *   debouncedSearch(e.target.value);
 * });
 * 
 * // Form validation debouncing
 * const debouncedValidation = debounce((formData: FormData) => {
 *   const errors = validateForm(formData);
 *   showValidationErrors(errors);
 * }, 500);
 * 
 * form.addEventListener('input', () => {
 *   debouncedValidation(new FormData(form));
 * });
 * 
 * // Auto-save functionality
 * const debouncedSave = debounce(async (content: string) => {
 *   await saveToServer(content);
 *   showSaveIndicator();
 * }, 2000);
 * 
 * editor.addEventListener('change', () => {
 *   debouncedSave(editor.getContent());
 * });
 * 
 * // Using debounced function management
 * debouncedSearch.cancel(); // Cancel pending search
 * console.log(debouncedSearch.pending()); // Check if search is pending
 * 
 * // Execute search immediately without waiting
 * const results = debouncedSearch.flush();
 * 
 * // Object method debouncing with context preservation
 * const dataProcessor = {
 *   data: [],
 *   process: debounce(function(this: any, newData: any[]) {
 *     this.data = [...this.data, ...newData];
 *     console.log('Processed data:', this.data);
 *   }, 1000)
 * };
 * 
 * dataProcessor.process([1, 2, 3]); // Context is preserved correctly
 * ```
 * 
 * @warning Be aware that debounced functions don't return values immediately
 * @note Timer cleanup prevents memory leaks in long-running applications
 * @consider Using flush() when immediate execution is needed in specific scenarios
 * @see throttle for complementary rate limiting with different timing behavior
 */
const debounce = <T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): DebouncedFunction<T> => {
  // INPUT VALIDATION: Ensure function and delay parameters are valid
  if (typeof fn !== 'function') {
    throw new TypeError('Expected fn to be a function');
  }
  if (typeof delay !== 'number' || delay < 0) {
    throw new TypeError('Expected delay to be a non-negative number');
  }

  // STATE MANAGEMENT: Track debounce timing and execution context
  let timeoutId: ReturnType<typeof setTimeout> | null = null;  // Pending execution timer
  let lastArgs: Parameters<T> | null = null;                   // Most recent arguments
  let lastThis: any = null;                                    // Function execution context
  let result: ReturnType<T> | undefined;                        // Last execution result

  /**
   * Creates the debounced function with timer-based delay logic.
   */
  const debounced: DebouncedFunction<T> = function(this: any, ...args: Parameters<T>) {
    // STATE UPDATE: Store latest arguments and context
    lastArgs = args;                   // Preserve most recent arguments
    lastThis = this;                    // Preserve execution context
    
    // TIMER MANAGEMENT: Cancel any existing pending execution
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // SCHEDULE DELAYED EXECUTION: Set timer for function execution
    timeoutId = setTimeout(() => {
      // EXECUTION: Clear timer state and execute function
      timeoutId = null;
      
      if (lastArgs) {
        result = fn.apply(lastThis, lastArgs);
        // Clean up stored references to prevent memory leaks
        lastArgs = null;
        lastThis = null;
      }
    }, delay);
    
    // RETURN: Return last result (may be undefined for first call)
    return result;
  } as DebouncedFunction<T>;

  /**
   * Cancels any pending function execution and resets state.
   * 
   * This method is useful for preventing unnecessary executions
   * when conditions change or components are unmounted.
   */
  debounced.cancel = function(): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    // Clear stored references to prevent memory leaks
    lastArgs = null;
    lastThis = null;
  };

  /**
   * Executes the pending function immediately and cancels the timer.
   * 
   * Useful when you need immediate execution while still maintaining
   * debouncing behavior for subsequent calls.
   * 
   * @returns The result of the function execution if it was pending, undefined otherwise
   */
  debounced.flush = function(): ReturnType<T> | undefined {
    if (timeoutId) {
      // Cancel pending timer
      clearTimeout(timeoutId);
      timeoutId = null;
      
      // Execute immediately with stored arguments
      if (lastArgs) {
        result = fn.apply(lastThis, lastArgs);
        // Clean up stored references
        lastArgs = null;
        lastThis = null;
      }
    }
    
    return result;
  };

  /**
   * Checks if function execution is currently pending.
   * 
   * Useful for conditional logic or debugging purposes.
   * 
   * @returns true if execution is scheduled and waiting for delay to pass
   */
  debounced.pending = function(): boolean {
    return timeoutId !== null;
  };

  return debounced;
};

export default debounce;
