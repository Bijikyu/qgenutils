/**
 * Enhanced Security Middleware for HTTP Clients
 * 
 * Provides comprehensive security features for HTTP operations including
 * request validation, response filtering, and attack prevention.
 */

import { sanitizeInput, detectSqlInjection, detectCommandInjection, isValidUrl } from './inputSanitization.js';

/**
 * Security configuration for HTTP requests
 */
interface HttpSecurityConfig {
  maxUrlLength?: number;
  maxHeaderSize?: number;
  maxRequestBodySize?: number;
  allowedMethods?: string[];
  allowedContentTypes?: string[];
  enableCsrfProtection?: boolean;
  enableRateLimiting?: boolean;
  rateLimitWindow?: number;
  rateLimitMax?: number;
  securityHeaders?: boolean;
  validateUrls?: boolean;
  sanitizeInput?: boolean;
}

/**
 * Default security configuration
 */
const DEFAULT_SECURITY_CONFIG: Required<HttpSecurityConfig> = {
  maxUrlLength: 2048,
  maxHeaderSize: 8192,
  maxRequestBodySize: 10 * 1024 * 1024, // 10MB
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedContentTypes: [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain'
  ],
  enableCsrfProtection: true,
  enableRateLimiting: true,
  rateLimitWindow: 60000, // 1 minute
  rateLimitMax: 100, // 100 requests per minute
  securityHeaders: true,
  validateUrls: true,
  sanitizeInput: true
};

/**
 * Rate limiting storage (in production, use Redis or similar)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Validates HTTP method against allowed methods
 * @param method - HTTP method
 * @param config - Security configuration
 * @returns True if method is allowed
 */
function validateHttpMethod(method: string, config: Required<HttpSecurityConfig>): boolean {
  return config.allowedMethods.includes(method.toUpperCase());
}

/**
 * Validates request headers for security issues
 * @param headers - Request headers
 * @param config - Security configuration
 * @returns True if headers are valid
 */
function validateHeaders(headers: Record<string, any>, config: Required<HttpSecurityConfig>): boolean {
  for (const [key, value] of Object.entries(headers)) {
    // Check header size
    if (String(value).length > config.maxHeaderSize) {
      return false;
    }
    
    // Check for dangerous headers
    const dangerousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr'
    ];
    
    if (dangerousHeaders.includes(key.toLowerCase()) && !isValidHeaderValue(String(value))) {
      return false;
    }
    
    // Check for injection patterns
    if (detectSqlInjection(String(value)) || detectCommandInjection(String(value))) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validates header value for malicious content
 * @param value - Header value
 * @returns True if header value is safe
 */
function isValidHeaderValue(value: string): boolean {
  // Prevent newline injection
  if (/\r|\n/.test(value)) {
    return false;
  }
  
  // Prevent header injection
  if (value.includes(':') && value.includes('\x00')) {
    return false;
  }
  
  return true;
}

/**
 * Implements rate limiting for requests
 * @param identifier - Client identifier (IP address or user ID)
 * @param config - Security configuration
 * @returns True if request is allowed
 */
function checkRateLimit(identifier: string, config: Required<HttpSecurityConfig>): boolean {
  if (!config.enableRateLimiting) {
    return true;
  }
  
  const now = Date.now();
  const windowStart = now - config.rateLimitWindow;
  
  // Get current rate limit data
  let rateLimitData = rateLimitStore.get(identifier);
  
  if (!rateLimitData || rateLimitData.resetTime < now) {
    // Reset or create new rate limit entry
    rateLimitData = {
      count: 0,
      resetTime: now + config.rateLimitWindow
    };
    rateLimitStore.set(identifier, rateLimitData);
  }
  
  // Increment count and check limit
  rateLimitData.count++;
  
  return rateLimitData.count <= config.rateLimitMax;
}

/**
 * Generates security headers for HTTP responses
 * @returns Object containing security headers
 */
function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  };
}

/**
 * Validates request body for security issues
 * @param body - Request body
 * @param contentType - Content type
 * @param config - Security configuration
 * @returns True if body is valid
 */
function validateRequestBody(body: any, contentType: string, config: Required<HttpSecurityConfig>): boolean {
  // Check body size
  let bodySize: number;
  try {
    bodySize = JSON.stringify(body).length;
  } catch {
    // Handle circular reference or non-serializable objects
    bodySize = 0;
    return false;
  }
  if (bodySize > config.maxRequestBodySize) {
    return false;
  }
  
  // Validate based on content type
  if (contentType.includes('application/json')) {
    return validateJsonBody(body);
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    return validateFormBody(body);
  }
  
  return true;
}

/**
 * Validates JSON request body
 * @param body - JSON body
 * @returns True if valid
 */
function validateJsonBody(body: any): boolean {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  
  // Check for prototype pollution - comprehensive check
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  const bodyKeys = Object.keys(body);
  const bodyProtoKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(body));
  
  for (const key of bodyKeys) {
    if (dangerousKeys.includes(key)) {
      return false;
    }
  }
  
  // Check prototype chain for pollution
  for (const protoKey of bodyProtoKeys) {
    if (dangerousKeys.includes(protoKey)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validates form-encoded request body
 * @param body - Form body
 * @returns True if valid
 */
function validateFormBody(body: Record<string, any>): boolean {
  for (const [key, value] of Object.entries(body)) {
    // Check for injection patterns
    if (detectSqlInjection(String(value)) || detectCommandInjection(String(value))) {
      return false;
    }
    
    // Check for dangerous key names
    if (key.startsWith('__') || key.includes('proto')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Main security validation function for HTTP requests
 * @param request - Request object
 * @param config - Security configuration
 * @returns Validation result with details
 */
function validateHttpRequest(request: {
  method: string;
  url: string;
  headers: Record<string, any>;
  body?: any;
  clientIdentifier?: string;
}, config: Partial<HttpSecurityConfig> = {}): { valid: boolean; error?: string; sanitizedBody?: any } {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  
  // Validate HTTP method
  if (!validateHttpMethod(request.method, securityConfig)) {
    return { valid: false, error: 'Method not allowed' };
  }
  
  // Validate URL
  if (securityConfig.validateUrls && !isValidUrl(request.url)) {
    return { valid: false, error: 'Invalid URL' };
  }
  
  // Validate URL length
  if (request.url.length > securityConfig.maxUrlLength) {
    return { valid: false, error: 'URL too long' };
  }
  
  // Validate headers
  if (!validateHeaders(request.headers, securityConfig)) {
    return { valid: false, error: 'Invalid headers' };
  }
  
  // Rate limiting
  if (request.clientIdentifier && !checkRateLimit(request.clientIdentifier, securityConfig)) {
    return { valid: false, error: 'Rate limit exceeded' };
  }
  
  // Validate request body
  if (request.body) {
    const contentType = request.headers['content-type'] || 'application/json';
    
    if (!securityConfig.allowedContentTypes.some(type => contentType.includes(type))) {
      return { valid: false, error: 'Content type not allowed' };
    }
    
    if (!validateRequestBody(request.body, contentType, securityConfig)) {
      return { valid: false, error: 'Invalid request body' };
    }
    
    // Sanitize body if enabled
    let sanitizedBody = request.body;
    if (securityConfig.sanitizeInput) {
      sanitizedBody = sanitizeRequestBody(request.body, contentType);
    }
    
    return { valid: true, sanitizedBody };
  }
  
  return { valid: true };
}

/**
 * Sanitizes request body
 * @param body - Request body to sanitize
 * @param contentType - Content type
 * @returns Sanitized body
 */
function sanitizeRequestBody(body: any, contentType: string): any {
  if (contentType.includes('application/json')) {
    return sanitizeJsonBody(body);
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    return sanitizeFormBody(body);
  }
  
  return body;
}

/**
 * Recursively sanitizes JSON object
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
function sanitizeJsonBody(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJsonBody(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip dangerous keys
      if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
        sanitized[key] = sanitizeJsonBody(value);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitizes form-encoded body
 * @param body - Form body
 * @returns Sanitized body
 */
function sanitizeFormBody(body: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(body)) {
    // Skip dangerous keys
    if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
      sanitized[key] = sanitizeInput(String(value));
    }
  }
  
  return sanitized;
}

export {
  HttpSecurityConfig,
  validateHttpRequest,
  getSecurityHeaders,
  checkRateLimit,
  validateRequestBody,
  sanitizeRequestBody
};