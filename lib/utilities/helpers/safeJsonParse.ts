/**
 * Prototype Pollution Detection - Security Scanner
 * 
 * This function recursively scans objects for prototype pollution vulnerabilities.
 * Prototype pollution is a critical security vulnerability where malicious JSON
 * can modify Object.prototype, affecting all objects in the application.
 * 
 * Security Strategy:
 * - Detects dangerous properties: __proto__, constructor, prototype
 * - Recursive scanning for nested pollution attempts
 * - Circular reference protection using WeakSet
 * - Early termination on pollution detection
 * 
 * Threat Model:
 * - Attack Vector: Malicious JSON with prototype properties
 * - Impact: Global object modification, privilege escalation
 * - Severity: Critical (CVE-worthy vulnerability)
 * - Mitigation: Detection and rejection of polluted objects
 * 
 * Detection Criteria:
 * - Direct assignment to __proto__ property
 * - Constructor prototype modification attempts
 * - Nested object pollution via recursive scanning
 * - Object.prototype chain contamination
 * 
 * Performance Considerations:
 * - WeakSet for efficient circular reference detection
 * - Early return on pollution detection
 * - Minimal overhead for clean objects
 * - Recursive depth limited by object structure
 * 
 * @param {any} obj - Object to scan for prototype pollution
 * @param {WeakSet} visited - Set of visited objects for circular reference protection
 * @returns {boolean} True if prototype pollution is detected, false otherwise
 */
function checkPrototypePollution(obj: any, visited = new WeakSet()): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  if (visited.has(obj)) {
    return false;
  }
  
  visited.add(obj);
  
  // Check for dangerous properties
  if (obj.hasOwnProperty('__proto__') || 
      obj.hasOwnProperty('constructor') || 
      obj.hasOwnProperty('prototype')) {
    return true;
  }
  
  // Recursively check nested objects
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
      if (checkPrototypePollution(obj[key], visited)) {
        return true;
      }
    }
  }
  
  return false;
}

import { qerrors } from 'qerrors';

/**
 * Secure JSON Parser with Prototype Pollution Protection
 * 
 * Provides secure JSON parsing with comprehensive error handling and security
 * validation. This function prevents prototype pollution attacks and ensures
 * safe JSON deserialization in security-sensitive applications.
 * 
 * Security Features:
 * - Prototype pollution detection and prevention
 * - Input validation for type safety
 * - Error boundary protection
 * - Safe fallback to default values
 * - Comprehensive error logging with qerrors
 * 
 * Protection Strategy:
 * 1. Input Validation: Ensures input is a string
 * 2. JSON Parsing: Standard JSON.parse with try-catch
 * 3. Security Scanning: Recursive prototype pollution detection
 * 4. Safe Fallback: Returns default value on any failure
 * 5. Error Reporting: Detailed logging for security monitoring
 * 
 * Use Cases:
 * - API request body parsing
 * - Configuration file loading
 * - User input processing
 * - External data ingestion
 * - Security-critical JSON handling
 * 
 * Error Handling:
 * - Type errors: Non-string input returns default value
 * - Parse errors: Malformed JSON returns default value
 * - Security errors: Prototype pollution returns default value
 * - All errors logged with qerrors for monitoring
 * 
 * Performance Notes:
 * - Minimal overhead for clean JSON
 * - Early security validation
 * - Efficient recursive scanning
 * - Suitable for high-frequency parsing
 * 
 * @param {string} jsonString - JSON string to parse securely
 * @param {*} defaultValue - Default value returned on parsing failures (default: null)
 * @returns {*} Parsed JavaScript object or default value on failure
 * 
 * @example
 * // Safe parsing with default value
 * const config = safeJsonParse('{"name": "test"}', {});
 * 
 * @example
 * // Security protection
 * const malicious = '{"__proto__": {"admin": true}}';
 * const result = safeJsonParse(malicious, null); // Returns null due to pollution
 */
function safeJsonParse(jsonString: string, defaultValue: any = null): any {
  if (typeof jsonString !== 'string') {
    return defaultValue;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    // Prevent prototype pollution by recursively checking dangerous properties
    if (typeof parsed === 'object' && parsed !== null) {
      const hasDangerousProps = checkPrototypePollution(parsed);
      if (hasDangerousProps) {
        const prototypeError = new Error('Prototype pollution detected in JSON');
        // Fix: Use correct 2-parameter qerrors API
        qerrors(prototypeError, 'safeJsonParse');
        return defaultValue;
      }
    }
    return parsed;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safeJsonParse', `JSON parsing failed for string length: ${jsonString.length}`);
    return defaultValue;
  }
}

export default safeJsonParse;