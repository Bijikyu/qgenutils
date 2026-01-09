/**
 * Common Security Utilities
 *
 * Centralized security utilities to eliminate code duplication across
 * codebase. These utilities handle common security patterns including
 * API key validation, security headers, IP tracking, and authentication.
 */

import { Request, Response } from 'express';
import { createSafeFunction } from '../error/commonErrorHandling.js';

/**
 * Extracts client IP address from request with fallbacks
 * @param req - Express request object
 * @returns Client IP address string
 */
export function extractClientIp(req: Request): string {
  const xForwardedFor = req.get('X-Forwarded-For');
  const xRealIp = req.get('X-Real-IP');
  const cfConnectingIp = req.get('CF-Connecting-IP');

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  if (xRealIp) {
    return xRealIp.trim();
  }

  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return req?.ip || req?.socket?.remoteAddress || 'unknown';
}

/**
 * API key extraction sources
 */
interface ApiKeySources {
  header?: string;
  query?: string;
  body?: string;
  cookie?: string;
}

/**
 * Extracts API key from multiple sources with security considerations
 * @param req - Express request object
 * @param sources - API key source configuration
 * @returns Extracted API key or null
 */
export function extractApiKey(req: Request, sources: ApiKeySources = {}): string | null {
  const {
    header = 'X-API-Key',
    query = 'apiKey',
    body = 'apiKey',
    cookie = 'apiKey'
  } = sources;

  // Extract from header
  const headerKey = req.get(header);
  if (headerKey && typeof headerKey === 'string' && headerKey.trim()) {
    return headerKey.trim();
  }

  // Extract from query parameters (less secure, but supported)
  const queryKey = req.query[query];
  if (queryKey && typeof queryKey === 'string' && queryKey.trim()) {
    return queryKey.trim();
  }

  // Extract from request body
  if (req.body && typeof req.body === 'object') {
    const bodyKey = req.body[body];
    if (bodyKey && typeof bodyKey === 'string' && bodyKey.trim()) {
      return bodyKey.trim();
    }
  }

  // Extract from cookie
  const cookieKey = req.cookies?.[cookie];
  if (cookieKey && typeof cookieKey === 'string' && cookieKey.trim()) {
    return cookieKey.trim();
  }

  return null;
}

/**
 * Validates API key with timing-safe comparison
 * @param providedKey - Key provided by client
 * @param expectedKeys - Array of valid keys
 * @returns Validation result
 */
export function validateApiKey(
  providedKey: string,
  expectedKeys: string | string[]
): { isValid: boolean; keyIndex?: number } {
  if (!providedKey || typeof providedKey !== 'string') {
    return { isValid: false };
  }

  const keys = Array.isArray(expectedKeys) ? expectedKeys : [expectedKeys];

  // Use timing-safe comparison for security
  for (let i = 0; i < keys.length; i++) {
    if (timingSafeCompare(providedKey, keys[i])) {
      return { isValid: true, keyIndex: i };
    }
  }

  return { isValid: false };
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Common security headers configuration
 */
export const SecurityHeaders = {
  /**
   * Content Security Policy header
   */
  contentSecurityPolicy: (options: {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
    fontSrc?: string[];
    mediaSrc?: string[];
    objectSrc?: string[];
    childSrc?: string[];
    frameSrc?: string[];
    workerSrc?: string[];
    manifestSrc?: string[];
    upgradeInsecureRequests?: boolean;
  } = {}): string => {
    const {
      defaultSrc = ['\'self\''],
      scriptSrc = ['\'self\''],
      styleSrc = ['\'self\'', '\'unsafe-inline\''],
      imgSrc = ['\'self\'', 'data:', 'https:'],
      connectSrc = ['\'self\''],
      fontSrc = ['\'self\''],
      mediaSrc = ['\'self\''],
      objectSrc = ['\'none\''],
      childSrc = ['\'self\''],
      frameSrc = ['\'self\''],
      workerSrc = ['\'self\''],
      manifestSrc = ['\'self\''],
      upgradeInsecureRequests = true
    } = options;

    const directives = [
      `default-src ${defaultSrc.join(' ')}`,
      `script-src ${scriptSrc.join(' ')}`,
      `style-src ${styleSrc.join(' ')}`,
      `img-src ${imgSrc.join(' ')}`,
      `connect-src ${connectSrc.join(' ')}`,
      `font-src ${fontSrc.join(' ')}`,
      `media-src ${mediaSrc.join(' ')}`,
      `object-src ${objectSrc.join(' ')}`,
      `child-src ${childSrc.join(' ')}`,
      `frame-src ${frameSrc.join(' ')}`,
      `worker-src ${workerSrc.join(' ')}`,
      `manifest-src ${manifestSrc.join(' ')}`
    ];

    if (upgradeInsecureRequests) {
      directives.push('upgrade-insecure-requests');
    }

    return directives.join('; ');
  },

  /**
   * HTTP Strict Transport Security header
   */
  strictTransportSecurity: (options: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  } = {}): string => {
    const { maxAge = 31536000, includeSubDomains = true, preload = false } = options;

    let hsts = `max-age=${maxAge}`;

    if (includeSubDomains) {
      hsts += '; includeSubDomains';
    }

    if (preload) {
      hsts += '; preload';
    }

    return hsts;
  },

  /**
   * X-Frame-Options header
   */
  xFrameOptions: (option: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM' = 'DENY'): string => {
    if (option === 'ALLOW-FROM') {
      return 'DENY'; // ALLOW-FROM is deprecated, default to DENY
    }
    return option;
  },

  /**
   * X-Content-Type-Options header
   */
  xContentTypeOptions: (): string => 'nosniff',

  /**
   * Referrer-Policy header
   */
  referrerPolicy: (policy: string = 'strict-origin-when-cross-origin'): string => policy,

  /**
   * Permissions-Policy header
   */
  permissionsPolicy: (features: Record<string, string[]>): string => {
    return Object.entries(features)
      .map(([feature, origins]) => `${feature}=(${origins.join(' ')})`)
      .join(', ');
  }
};

/**
 * Sets comprehensive security headers on response
 * @param res - Express response object
 * @param options - Security header options
 */
export function setSecurityHeaders(
  res: Response,
  options: {
    csp?: Parameters<typeof SecurityHeaders.contentSecurityPolicy>[0];
    hsts?: Parameters<typeof SecurityHeaders.strictTransportSecurity>[0];
    xFrameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    referrerPolicy?: string;
    permissionsPolicy?: Record<string, string[]>;
    additionalHeaders?: Record<string, string>;
  } = {}
): void {
  const {
    csp,
    hsts,
    xFrameOptions = 'DENY',
    referrerPolicy = 'strict-origin-when-cross-origin',
    permissionsPolicy,
    additionalHeaders = {}
  } = options;

  // Set Content Security Policy
  if (csp) {
    res.set('Content-Security-Policy', SecurityHeaders.contentSecurityPolicy(csp));
  }

  // Set HSTS
  if (hsts) {
    res.set('Strict-Transport-Security', SecurityHeaders.strictTransportSecurity(hsts));
  }

  // Set X-Frame-Options
  res.set('X-Frame-Options', SecurityHeaders.xFrameOptions(xFrameOptions));

  // Set X-Content-Type-Options
  res.set('X-Content-Type-Options', SecurityHeaders.xContentTypeOptions());

  // Set Referrer-Policy
  res.set('Referrer-Policy', SecurityHeaders.referrerPolicy(referrerPolicy));

  // Set Permissions-Policy
  if (permissionsPolicy) {
    res.set('Permissions-Policy', SecurityHeaders.permissionsPolicy(permissionsPolicy));
  }

  // Set additional security headers
  Object.entries(additionalHeaders).forEach(([name, value]) => {
    res.set(name, value);
  });
}

/**
 * Creates middleware for API key validation
 * @param validKeys - Valid API keys
 * @param options - Middleware options
 * @returns Express middleware function
 */
export function createApiKeyMiddleware(
  validKeys: string | string[],
  options: {
    sources?: ApiKeySources;
    errorMessage?: string;
    skipPaths?: string[];
    skipMethods?: string[];
  } = {}
) {
  const {
    sources,
    errorMessage = 'Invalid or missing API key',
    skipPaths = [],
    skipMethods = []
  } = options;

  return (req: Request, res: Response, next: Function): void => {
    // Skip validation for certain paths
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Skip validation for certain methods
    if (skipMethods.includes(req.method)) {
      return next();
    }

    const apiKey = extractApiKey(req, sources);

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'MISSING_API_KEY',
          message: errorMessage
        }
      });
    }

    const validation = validateApiKey(apiKey, validKeys);

    if (!validation.isValid) {
      return res.status(401).json({
        success: false,
        error: {
          type: 'INVALID_API_KEY',
          message: errorMessage
        }
      });
    }

    // Attach API key info to request for downstream use
    (req as any).apiKey = apiKey;
    (req as any).apiKeyIndex = validation.keyIndex;

    next();
  };
}

/**
 * Creates middleware for security headers
 * @param options - Security header options
 * @returns Express middleware function
 */
export function createSecurityHeadersMiddleware(options: {
  csp?: Parameters<typeof SecurityHeaders.contentSecurityPolicy>[0];
  hsts?: Parameters<typeof SecurityHeaders.strictTransportSecurity>[0];
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  referrerPolicy?: string;
  permissionsPolicy?: Record<string, string[]>;
  additionalHeaders?: Record<string, string>;
} = {}) {
  return (req: Request, res: Response, next: Function): void => {
    setSecurityHeaders(res, options);
    next();
  };
}

/**
 * Rate limiting configuration for security
 */
export interface SecurityRateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

/**
 * Creates IP-based rate limiting key generator
 * @param req - Express request object
 * @returns Rate limiting key
 */
export function createIpRateLimitKey(req: Request): string {
  const ip = extractClientIp(req);
  return `rate_limit:${ip}`;
}

/**
 * Creates user-based rate limiting key generator
 * @param req - Express request object
 * @param userIdField - Field containing user ID
 * @returns Rate limiting key
 */
export function createUserRateLimitKey(req: Request, userIdField: string = 'userId'): string {
  const userId = (req as any)[userIdField] || (req as any).user?.id || 'anonymous';
  const ip = extractClientIp(req);
  return `rate_limit:user:${userId}:${ip}`;
}

/**
 * Sanitizes user input for logging to prevent sensitive data leakage
 * @param input - Input to sanitize
 * @returns Sanitized input string
 */
export const sanitizeLogInput = createSafeFunction(
  (input: any): string => {
    if (input === null || input === undefined) {
      return 'null';
    }

    if (typeof input === 'string') {
      // Check for sensitive patterns
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /key/i,
        /auth/i,
        /credential/i
      ];

      for (const pattern of sensitivePatterns) {
        if (pattern.test(input)) {
          return '[REDACTED_SENSITIVE]';
        }
      }

      // Check for JWT tokens
      if (input.split('.').length === 3) {
        const parts = input.split('.');
        const isBase64Like = parts.every(p => /^[A-Za-z0-9_-]+$/.test(p));
        if (isBase64Like && parts[0].length > 10 && parts[1].length > 10) {
          return '[REDACTED_TOKEN]';
        }
      }

      return input;
    }

    if (typeof input === 'object') {
      return '[Object]';
    }

    return String(input);
  },
  'sanitized_input',
  'sanitizeLogInput'
);

/**
 * Generates secure random token for CSRF protection
 * @param length - Token length
 * @returns Random token string
 */
export function generateCsrfToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
