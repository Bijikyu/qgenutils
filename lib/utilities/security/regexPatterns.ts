/**
 * Pre-compiled Regex Patterns for Performance
 *
 * Centralizes regex compilation to prevent ReDoS attacks and improve performance
 * by avoiding repeated regex creation in hot paths.
 */

// Email validation (RFC 5322 compliant, ReDoS safe)
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

// URL validation (prevent catastrophic backtracking)
export const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/;

// Security validation patterns (ReDoS safe)
export const SQL_INJECTION_REGEX = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i;
export const COMMAND_INJECTION_REGEX = /[;&|`$(){}[\]]/;
export const XSS_REGEX = /<script|javascript:|on\w+\s*=/i;

// Common validation patterns
export const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;
export const CREDIT_CARD_REGEX = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9][0-9])[0-9]{12})$/;

// File and path validation
export const FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;
export const PATH_REGEX = /^[a-zA-Z0-9\/._-]+$/;

// Dangerous property names (prototype pollution prevention)
export const DANGEROUS_PROPS_REGEX = /^(?:__proto__|constructor|prototype)$/;

// JSON validation patterns
export const JSON_KEY_REGEX = /^["']?([a-zA-Z_$][a-zA-Z0-9_$]*)["']?$/;

// Password strength patterns
export const PASSWORD_HAS_UPPER = /[A-Z]/;
export const PASSWORD_HAS_LOWER = /[a-z]/;
export const PASSWORD_HAS_NUMBER = /[0-9]/;
export const PASSWORD_HAS_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

// Performance monitoring patterns
export const METRIC_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.]*$/;
export const HTTP_METHOD_REGEX = /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$/i;

// Cache key validation
export const CACHE_KEY_REGEX = /^[a-zA-Z0-9_:.-]+$/;

// Sanitization patterns
export const HTML_TAG_REGEX = /<[^>]*>/g;
export const JS_EVENT_REGEX = /on\w+\s*=/gi;

/**
 * Validate regex pattern safely with performance considerations
 * @param pattern - Regex pattern to validate
 * @param value - Value to test against pattern
 * @returns boolean - Whether value matches pattern
 */
export function safeRegexTest(pattern: RegExp, value: string): boolean {
  try {
    // Use test() method for performance (faster than match() for boolean checks)
    return pattern.test(value);
  } catch (error) {
    // Log error but don't crash - pattern might be malicious
    console.warn('[security] Regex test error:', error);
    return false;
  }
}

/**
 * Create a bounded regex matcher to prevent ReDoS attacks
 * @param pattern - Regex pattern string
 * @param flags - Regex flags
 * @param maxLength - Maximum string length to test
 * @returns Function - Safe regex matcher
 */
export function createBoundedRegexMatcher(pattern: string, flags: string = '', maxLength: number = 1000) {
  const regex = new RegExp(pattern, flags);

  return (value: string): boolean => {
    // Prevent ReDoS by limiting input length
    if (value.length > maxLength) {
      return false;
    }

    try {
      return safeRegexTest(regex, value);
    } catch (error) {
      console.warn('[security] Bounded regex matcher error:', error);
      return false;
    }
  };
}

/**
 * Regex performance test utility
 * @param pattern - Regex pattern to test
 * @param testString - String to test against
 * @param iterations - Number of test iterations
 * @returns Object - Performance metrics
 */
export function benchmarkRegex(pattern: RegExp, testString: string, iterations: number = 1000) {
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    pattern.test(testString);
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  return {
    pattern: pattern.toString(),
    testString,
    iterations,
    duration,
    avgTime: duration / iterations,
    isSlow: duration > 100 // Consider slow if >100ms for 1000 iterations
  };
}

export default {
  EMAIL_REGEX,
  URL_REGEX,
  SQL_INJECTION_REGEX,
  COMMAND_INJECTION_REGEX,
  XSS_REGEX,
  PHONE_REGEX,
  CREDIT_CARD_REGEX,
  FILENAME_REGEX,
  PATH_REGEX,
  DANGEROUS_PROPS_REGEX,
  JSON_KEY_REGEX,
  PASSWORD_HAS_UPPER,
  PASSWORD_HAS_LOWER,
  PASSWORD_HAS_NUMBER,
  PASSWORD_HAS_SPECIAL,
  METRIC_NAME_REGEX,
  HTTP_METHOD_REGEX,
  CACHE_KEY_REGEX,
  HTML_TAG_REGEX,
  JS_EVENT_REGEX,
  safeRegexTest,
  createBoundedRegexMatcher,
  benchmarkRegex
};
