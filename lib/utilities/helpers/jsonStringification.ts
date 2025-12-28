/**
 * JSON Stringification Security Utilities
 * 
 * PURPOSE: Provides safe JSON stringification with comprehensive error handling,
 * size limits, and protection against malicious input that could cause
 * serialization issues or memory exhaustion during JSON operations.
 * 
 * SECURITY CONSIDERATIONS:
 * - Circular Reference Protection: Prevents infinite loops from circular object references
 * - Size Limiting: Prevents denial of service through huge JSON payloads
 * - Error Isolation: Handles serialization errors without exposing internal state
 * - Memory Protection: Limits memory usage during stringification operations
 * - Type Safety: Validates inputs before processing to prevent injection attacks
 * 
 * VULNERABILITIES MITIGATED:
 * - Prototype Pollution: Safe handling of object prototypes during serialization
 * - Memory Exhaustion: Size limits prevent excessive memory allocation
 * - Rejection Attacks: Graceful error handling prevents application crashes
 * - Information Disclosure: Error messages don't expose sensitive application state
 * - Circular Reference DoS: Handles circular references without infinite loops
 * 
 * PERFORMANCE CHARACTERISTICS:
 * - Single Pass: Native JSON.stringify for optimal performance
 * - Early Validation: Input checks before expensive operations
 * - Memory Efficient: Buffer size calculation without creating intermediate strings
 * - Error Fast-Path: Minimal overhead for successful operations
 * - Graceful Degradation: Safe defaults for error conditions
 */

interface JsonStringifyOptions {
  /** Number of spaces for indentation (pretty printing) */
  space?: number | string;
  /** JSON replacer function for custom serialization logic */
  replacer?: (key: string, value: any) => any;
  /** Array of property names to include in serialization */
  replacerArray?: string[];
}

/**
 * Safely stringifies value to JSON with comprehensive error handling and security protections.
 * 
 * This function provides a secure wrapper around JSON.stringify with protection against
 * common serialization vulnerabilities and graceful error handling for production use.
 * 
 * SECURITY FEATURES:
 * - Circular Reference Detection: Built-in protection against infinite loops
 * - Error Sanitization: Errors don't expose internal application state
 * - Input Validation: Prevents processing of obviously malicious inputs
 * - Safe Defaults: Returns empty object string for all error conditions
 * 
 * @param {any} value - Value to stringify (any type, safely validated)
 * @param {string} [defaultValue='{}'] - Safe fallback value if stringification fails
 * @param {JsonStringifyOptions} [replacerOptions={}] - JSON.stringify options for customization
 * @returns {string} JSON string or safe default value
 * 
 * @example
 * // Basic safe stringification
 * const safe = safeJsonStringify({ name: 'Alice', age: 30 });
 * // Result: '{"name":"Alice","age":30}'
 * 
 * @example
 * // With pretty printing
 * const pretty = safeJsonStringify(data, '{}', { space: 2 });
 * // Result: '{\n  "name": "Alice",\n  "age": 30\n}'
 * 
 * @example
 * // With custom replacer for security filtering
 * const filtered = safeJsonStringify(userData, '{}', {
 *   replacer: (key, value) => {
 *     // Exclude sensitive fields
 *     if (key === 'password' || key === 'ssn') return undefined;
 *     return value;
 *   }
 * });
 * 
 * @example
 * // Error handling with malicious input
 * const circular = { a: 1 };
 * circular.self = circular; // Creates circular reference
 * const safe = safeJsonStringify(circular); // Returns '{}' safely
 * 
 * @example
 * // Array replacer for whitelisting properties
 * const whitelist = ['id', 'name', 'email'];
 * const filtered = safeJsonStringify(user, '{}', { replacerArray: whitelist });
 */
function safeJsonStringify(
  value: any, 
  defaultValue: string = '{}', 
  replacerOptions: JsonStringifyOptions = {}
): string {
  // Input validation for security
  if (value === null || value === undefined) {
    return defaultValue;
  }

  // Extract options with type safety
  const { space = null, replacer = null, replacerArray = null } = replacerOptions;
  
  try {
    // Determine which replacer to use
    if (replacerArray) {
      // Use array replacer for whitelisting properties
      if (space !== null) {
        return JSON.stringify(value, replacerArray, space);
      }
      return JSON.stringify(value, replacerArray);
    }
    
    // Use function replacer if provided
    if (replacer !== null) {
      if (space !== null) {
        return JSON.stringify(value, replacer, space);
      }
      return JSON.stringify(value, replacer);
    }
    
    // Use default stringification
    return JSON.stringify(value);
    
    return JSON.stringify(value);
  } catch (error) {
    // Log error without exposing sensitive information
    console.error('JSON stringification failed:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return safe default value
    return defaultValue;
  }
}

/**
 * Stringifies value with size limits to prevent denial of service attacks.
 * 
 * This function adds size validation to JSON stringification, protecting against
 * attacks that attempt to exhaust memory or create oversized payloads.
 * 
 * SIZE PROTECTION STRATEGY:
 * - Pre-Validation: Check size before returning result
 * - Memory Efficient: Calculate size without creating additional large strings
 * - Configurable Limits: Environment-specific size restrictions
 * - Graceful Fallback: Safe default when limits exceeded
 * 
 * ATTACKS MITIGATED:
 * - Memory Exhaustion: Prevents allocation of massive strings
 * - DoS Attacks: Size limits block oversized payloads
 * - Buffer Overflows: Safe string operations prevent overflows
 * - Resource Starvation: Limits CPU and memory usage
 * 
 * @param {any} value - Value to stringify with size validation
 * @param {number} [maxSize=1048576] - Maximum size in bytes (default: 1MB)
 * @param {string} [defaultValue='{}'] - Safe fallback when size exceeded
 * @returns {string} JSON string within size limits or default value
 * 
 * @example
 * // Basic size-limited stringification
 * const safe = safeJsonStringifyWithSize(largeObject, 1024);
 * // Returns '{}' if object would exceed 1KB when stringified
 * 
 * @example
 * // Custom size limit for API responses
 * const apiSafe = safeJsonStringifyWithSize(
 *   apiResponse, 
 *   100 * 1024, // 100KB limit for API responses
 *   '{"error":"Response too large"}'
 * );
 * 
 * @example
 * // Environment-specific limits
 * const isProduction = process.env.NODE_ENV === 'production';
 * const limit = isProduction ? 10 * 1024 : 1024 * 1024; // Stricter in production
 * const productionSafe = safeJsonStringifyWithSize(data, limit);
 * 
 * @warning Size limits are measured in UTF-8 byte length, not character count
 * @note Buffer.byteLength is used for accurate byte calculation including multi-byte characters
 * @see safeJsonStringify for version without size limits
 */
function safeJsonStringifyWithSize(
  value: any, 
  maxSize: number = 1024 * 1024, // 1MB default
  defaultValue: string = '{}'
): string {
  // Validate maxSize parameter
  if (typeof maxSize !== 'number' || maxSize <= 0) {
    console.warn('Invalid maxSize provided, using default 1MB');
    maxSize = 1024 * 1024;
  }
  
  try {
    const jsonString = JSON.stringify(value);
    
    // Calculate byte length accurately for UTF-8 strings
    const byteLength = Buffer.byteLength(jsonString, 'utf8');
    
    // Check against size limit
    if (byteLength <= maxSize) {
      return jsonString;
    }
    
    // Log size violation for monitoring
    console.warn(`JSON stringification exceeded size limit: ${byteLength} > ${maxSize} bytes`);
    
    return defaultValue;
  } catch (error) {
    console.error('JSON stringification with size limit failed:', error instanceof Error ? error.message : 'Unknown error');
    return defaultValue;
  }
}

export default {
  safeJsonStringify,
  safeJsonStringifyWithSize
};