/**
 * Constant-Time String Comparison
 * 
 * Compares two strings in constant time to prevent timing attacks.
 * Uses the safe-compare npm module which provides a specialized,
 * well-tested constant-time comparison implementation.
 * 
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal, false otherwise
 */
// @ts-ignore - safe-compare doesn't have TypeScript definitions
const safeCompare: any = require('safe-compare'); // rationale: specialized constant-time comparison module

const timingSafeCompare = (a: string, b: string): boolean => {
  // Enhanced type and safety checks
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  // Always use safeCompare, even for empty strings, to prevent timing attacks
  // safeCompare handles all cases including empty strings securely
  try {
    return safeCompare(a, b);
  } catch (error) {
    // If safe-compare fails, we cannot securely fall back as it would expose timing information
    // Log the error with proper context and monitoring for security issues
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Security: safe-compare failed - ${errorMsg}`, { 
      timestamp: new Date().toISOString(),
      context: 'timing_safe_comparison_failure'
    });
    return false;
  }
};

export default timingSafeCompare;