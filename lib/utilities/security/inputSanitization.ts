/**
 * Input Sanitization and Security Utilities
 * 
 * Provides comprehensive input validation, sanitization, and security utilities
 * to prevent common web vulnerabilities including XSS, injection attacks, and
 * data validation bypasses.
 * 
 * SECURITY FEATURES:
 * - HTML entity encoding for XSS prevention
 * - SQL injection pattern detection
 * - Command injection prevention
 * - Cross-site scripting (XSS) mitigation
 * - Content security validation
 * - Input length and type validation
 * - Unicode and encoding validation
 */

/**
 * Sanitizes input to prevent XSS attacks by encoding HTML entities
 * @param input - Raw input string
 * @returns Sanitized string with HTML entities encoded
 */
function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  if (input.length === 0) return input;
  
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  // Use safer regex pattern without ReDoS vulnerability
  return input.replace(/[&<>"'\/`=]/g, (char) => {
    return htmlEntities[char] || char;
  });
}

/**
 * Detects potential SQL injection patterns in input
 * @param input - Input string to validate
 * @returns True if SQL injection patterns are detected
 */
function detectSqlInjection(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\*\/|\/\*)/,
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i,
    /(1=1|1 = 1)/,
    /(\bWAITFOR\b.*DELAY\b)/i,
    /(\bXP_\w+|SP_\w+)/i,
    /(\bCONVERT\b|CAST\b)/i,
    /(\bCHAR\b|ASCII\b)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detects potential command injection patterns
 * @param input - Input string to validate
 * @returns True if command injection patterns are detected
 */
function detectCommandInjection(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  const commandPatterns = [
    /[;&|`$(){}[\]]/,
    /\b(curl|wget|nc|netcat|ssh|ftp|telnet)\b/i,
    /\b(rm|mv|cp|cat|ls|ps|kill|chmod|chown)\b/i,
    /\b(echo|printf|cat|type)\b.*[>|<]/,
    /\.\./,
    /\/etc\/passwd|\/etc\/shadow/,
    /\${[^}]*}/,
    /\\x[0-9a-fA-F]{2}/
  ];
  
  return commandPatterns.some(pattern => pattern.test(input));
}

/**
 * Validates and sanitizes user input comprehensively
 * @param input - Raw input value
 * @param options - Validation options
 * @returns Sanitized and validated input
 */
function sanitizeInput(input: any, options: {
  maxLength?: number;
  allowHtml?: boolean;
  allowSpecialChars?: boolean;
  trim?: boolean;
} = {}): string {
  const {
    maxLength = 1000,
    allowHtml = false,
    allowSpecialChars = true,
    trim = true
  } = options;
  
  // Type validation
  if (input === null || input === undefined) {
    return '';
  }
  
  const strInput = String(input);
  
  // Length validation
  if (strInput.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  let result = trim ? strInput.trim() : strInput;
  
  // HTML sanitization
  if (!allowHtml) {
    result = sanitizeHtml(result);
  }
  
  // Special characters validation
  if (!allowSpecialChars) {
    // Remove all non-alphanumeric and basic punctuation
    result = result.replace(/[^a-zA-Z0-9\s\-_.]/g, '');
  }
  
  return result;
}

/**
 * Validates email format with comprehensive checks
 * @param email - Email address to validate
 * @returns True if email is valid
 */
function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Basic format check
  if (!emailRegex.test(email)) return false;
  
  // Length constraints (RFC 5321)
  if (email.length > 254) return false;
  
  // Local part constraints
  const [localPart] = email.split('@');
  if (localPart.length > 64) return false;
  
  // Additional security checks
  if (detectSqlInjection(email) || detectCommandInjection(email)) {
    return false;
  }
  
  return true;
}

/**
 * Validates URL format and security
 * @param url - URL to validate
 * @param options - Validation options
 * @returns True if URL is valid and safe
 */
function isValidUrl(url: string, options: {
  allowedProtocols?: string[];
  allowLocalhost?: boolean;
  allowPrivateIp?: boolean;
} = {}): boolean {
  if (typeof url !== 'string') return false;
  
  const {
    allowedProtocols = ['http:', 'https:'],
    allowLocalhost = false,
    allowPrivateIp = false
  } = options;
  
  try {
    const parsedUrl = new URL(url);
    
    // Protocol validation
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Hostname validation
    if (!allowLocalhost && (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')) {
      return false;
    }
    
    // Private IP ranges validation
    if (!allowPrivateIp && isPrivateIp(parsedUrl.hostname)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if hostname is a private IP address
 * @param hostname - Hostname to check
 * @returns True if hostname is a private IP
 */
function isPrivateIp(hostname: string): boolean {
  const privateIpRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./, // Link-local
    /^fc00:/,     // IPv6 private
    /^fe80:/      // IPv6 link-local
  ];
  
  return privateIpRanges.some(range => range.test(hostname));
}

/**
 * Generates a secure random string for tokens, IDs, etc.
 * @param length - Length of the random string
 * @param charset - Optional character set to use
 * @returns Secure random string
 */
function generateSecureRandom(length: number = 32, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('Length must be a positive integer');
  }
  
  if (length > 1024) {
    throw new Error('Length cannot exceed 1024 characters');
  }
  
  let result = '';
  const randomValues = new Uint8Array(length);
  
  // Use crypto.getRandomValues for secure random generation
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(randomValues);
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }
  
  const resultArray: string[] = [];
  for (let i = 0; i < length; i++) {
    resultArray.push(charset.charAt(randomValues[i] % charset.length));
  }
  result = resultArray.join('');
  
  return result;
}

  /**
   * Parses and validates JSON input safely with async fallback for large payloads
   * @param jsonString - JSON string to parse
   * @param maxSize - Maximum size in bytes (default 1MB)
   * @returns Parsed and validated JSON object
   */
  async function parseJsonSafe(jsonString: string, maxSize: number = 1024 * 1024): Promise<any> {
    if (typeof jsonString !== 'string') {
      throw new Error('Input must be a string');
    }
    
    if (jsonString.length > maxSize) {
      throw new Error(`JSON input exceeds maximum size of ${maxSize} bytes`);
    }
    
    // Use worker thread for large payloads to prevent blocking
    if (jsonString.length > 100 * 1024) { // 100KB threshold
      try {
        // Check if worker pool is available
        const { parseJSONAsync } = await import('../performance/jsonWorkerPool.js');
        return await parseJSONAsync(jsonString);
      } catch {
        // Fallback to synchronous parsing if worker unavailable
      }
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validates JSON input for security issues with async support
   * @param jsonString - JSON string to validate
   * @param maxSize - Maximum size in bytes
   * @returns Parsed and validated object
   */
  async function validateAndParseJson(jsonString: string, maxSize: number = 1024 * 1024): Promise<any> {
    const parsed = await parseJsonSafe(jsonString, maxSize);
    
    // Check for prototype pollution patterns
    if (hasPrototypePollution(parsed)) {
      throw new Error('JSON contains potentially dangerous prototype pollution patterns');
    }
    
    return parsed;
  }

/**
 * Checks for prototype pollution in objects
 * @param obj - Object to check
 * @returns True if prototype pollution is detected
 */
function hasPrototypePollution(obj: any): boolean {
  if (obj && typeof obj === 'object') {
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    for (const key of Object.keys(obj)) {
      if (dangerousKeys.includes(key)) {
        return true;
      }
      
      if (typeof obj[key] === 'object' && hasPrototypePollution(obj[key])) {
        return true;
      }
    }
  }
  
  return false;
}

export {
  sanitizeHtml,
  detectSqlInjection,
  detectCommandInjection,
  sanitizeInput,
  isValidEmail,
  isValidUrl,
  generateSecureRandom,
  validateAndParseJson,
  hasPrototypePollution
};