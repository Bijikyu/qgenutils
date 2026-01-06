/**
 * SHARED SECURITY UTILITIES
 * 
 * PURPOSE: Provides security-focused utilities that complement existing patterns.
 * This utility eliminates duplication of security and sanitization logic.
 * 
 * DESIGN PRINCIPLES:
 * - Security-first implementation
 * - Input validation and sanitization
 * - Cross-site scripting protection
 * - Content Security Policy helpers
 * - Type-safe security operations
 */

import { TypeValidators, InputSanitizers } from './index.js';

/**
 * Security sanitization options.
 */
export interface SecurityOptions {
  /** Allow HTML tags */
  allowHtml?: boolean;
  /** Allow CSS styles */
  allowCss?: boolean;
  /** Allow certain HTML tags */
  allowedTags?: string[];
  /** Maximum string length */
  maxLength?: number;
  /** Encode special characters */
  encodeSpecialChars?: boolean;
}

/**
 * Security configuration for CSP headers.
 */
export interface CspConfig {
  /** Default source for content */
  defaultSrc?: string;
  /** Allowed script sources */
  scriptSrc?: string;
  /** Allowed style sources */
  styleSrc?: string;
  /** Allowed image sources */
  imgSrc?: string;
  /** Allowed font sources */
  fontSrc?: string;
  /** Allowed frame sources */
  frameSrc?: string;
  /** Allowed connect sources */
  connectSrc?: string;
  /** Frame ancestors */
  frameAncestors?: string;
  /** Form action */
  formAction?: string;
  /** Block mixed content */
  blockMixedContent?: boolean;
}

/**
 * Rate limiting security options.
 */
export interface SecureRateLimitOptions {
  /** Maximum requests per window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Enable IP-based limiting */
  enableIpLimiting?: boolean;
  /** Enable user-based limiting */
  enableUserLimiting?: boolean;
  /** Enable suspicious activity detection */
  enableSuspiciousDetection?: boolean;
  /** Blacklist support */
  blacklist?: string[];
}

/**
 * Creates enhanced HTML sanitization utilities.
 */
export const createHtmlSanitizer = (options: SecurityOptions = {}) => {
  const {
    allowHtml = false,
    allowCss = false,
    allowedTags = [],
    maxLength = 10000,
    encodeSpecialChars = true
  } = options;

  /**
   * Sanitizes HTML content to prevent XSS.
   */
  const sanitizeHtml = (input: any): string => {
    if (!TypeValidators.isString(input)) return '';

    let sanitized = InputSanitizers.quickSanitize(input);
    
    if (!allowHtml) {
      // Remove all HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    } else {
      // Only allow specific tags
      const tagRegex = new RegExp(`<(?!\\/?(${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
      sanitized = sanitized.replace(/<[^>]*>/g, (match) => {
        return tagRegex.test(match) ? match : '';
      });
    }
    
    if (!allowCss) {
      // Remove CSS in style attributes
      sanitized = sanitized.replace(/style="[^"]*"/gi, '');
      sanitized = sanitized.replace(/<style[^>]*>.*?<\/style>/gi, '');
    }

    // Encode special characters if requested
    if (encodeSpecialChars) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Enforce length limit
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  };

  /**
   * Validates content against security policies.
   */
  const validateContent = (content: string): { isValid: boolean; violations: string[] } => {
    const violations: string[] = [];

    // Check for potential XSS patterns
    const xssPatterns = [
      /javascript:/gi,
      /<script[^>]*>/gi,
      /on\w+\s*=/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ];

    xssPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        violations.push('Potential XSS pattern detected');
      }
    });

    // Check for SQL injection patterns
    const sqlPatterns = [
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi,
      /exec\s*\(/gi
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        violations.push('Potential SQL injection pattern detected');
      }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  };

  return {
    sanitizeHtml,
    validateContent
  };
};

/**
 * Creates Content Security Policy utilities.
 */
export const createCspBuilder = () => {
  /**
   * Builds CSP header value.
   */
  const buildCsp = (config: CspConfig): string => {
    const directives: string[] = [];

    if (config.defaultSrc) directives.push(`default-src ${config.defaultSrc}`);
    if (config.scriptSrc) directives.push(`script-src ${config.scriptSrc}`);
    if (config.styleSrc) directives.push(`style-src ${config.styleSrc}`);
    if (config.imgSrc) directives.push(`img-src ${config.imgSrc}`);
    if (config.fontSrc) directives.push(`font-src ${config.fontSrc}`);
    if (config.frameSrc) directives.push(`frame-src ${config.frameSrc}`);
    if (config.connectSrc) directives.push(`connect-src ${config.connectSrc}`);
    if (config.frameAncestors) directives.push(`frame-ancestors ${config.frameAncestors}`);
    if (config.formAction) directives.push(`form-action ${config.formAction}`);
    if (config.blockMixedContent) directives.push('block-all-mixed-content');

    return directives.join('; ');
  };

  /**
   * Creates nonce-based CSP.
   */
  const createNonceBasedCsp = (nonce: string): string => {
    return `script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; default-src 'self'`;
  };

  /**
   * Validates CSP directive values.
   */
  const validateCspDirective = (directive: string): { isValid: boolean; error?: string } => {
    const validDirectives = [
      'default-src', 'script-src', 'style-src', 'img-src', 'font-src',
      'frame-src', 'connect-src', 'frame-ancestors', 'form-action',
      'base-uri', 'manifest-src', 'object-src', 'report-uri', 'sandbox',
      'upgrade-insecure-requests', 'block-all-mixed-content'
    ];

    const directiveName = directive.split(' ')[0];
    
    if (!validDirectives.includes(directiveName)) {
      return {
        isValid: false,
        error: `Invalid CSP directive: ${directiveName}`
      };
    }

    return { isValid: true };
  };

  return {
    buildCsp,
    createNonceBasedCsp,
    validateCspDirective
  };
};

/**
 * Creates secure rate limiting utilities.
 */
export const createSecureRateLimit = (options: SecureRateLimitOptions) => {
  const {
    maxRequests,
    windowMs,
    enableIpLimiting = true,
    enableUserLimiting = false,
    enableSuspiciousDetection = true,
    blacklist = []
  } = options;

  const ipRequests = new Map<string, number[]>();
  const userRequests = new Map<string, number[]>();
  const suspiciousIps = new Set<string>();

  /**
   * Checks if IP is blacklisted.
   */
  const isIpBlacklisted = (ip: string): boolean => {
    return blacklist.some(blocked => blocked === ip || ip.startsWith(blocked));
  };

  /**
   * Checks for suspicious activity patterns.
   */
  const isSuspiciousActivity = (ip: string, requestCount: number): boolean => {
    if (!enableSuspiciousDetection) return false;

    // High request rate
    if (requestCount > maxRequests * 10) return true;

    // Rapid successive requests
    const ipRequestTimes = ipRequests.get(ip) || [];
    const now = Date.now();
    const recentCount = ipRequestTimes.filter(time => now - time < 5000).length;
    
    if (recentCount > maxRequests * 5) return true;

    return false;
  };

  /**
   * Records a request for rate limiting.
   */
  const recordRequest = (ip: string, userId?: string): boolean => {
    const now = Date.now();

    // Clean old entries
    const cutoffTime = now - windowMs;
    
    if (enableIpLimiting) {
      const ipRequestTimes = ipRequests.get(ip) || [];
      ipRequests.set(ip, ipRequestTimes.filter(time => time > cutoffTime).concat(now));
    }

    if (enableUserLimiting && userId) {
      const userRequestTimes = userRequests.get(userId) || [];
      userRequests.set(userId, userRequestTimes.filter(time => time > cutoffTime).concat(now));
    }

    // Check blacklisting
    if (isIpBlacklisted(ip)) {
      return false;
    }

    // Check suspicious activity
    const ipRequestTimes = ipRequests.get(ip) || [];
    const requestCount = ipRequestTimes.length;
    
    if (isSuspiciousActivity(ip, requestCount)) {
      suspiciousIps.add(ip);
      return false;
    }

    const ipRequestTimes = ipRequests.get(ip) || [];
    return ipRequestTimes.length < maxRequests;
  };

  /**
   * Gets rate limit status for IP.
   */
  const getIpStatus = (ip: string) => {
    const requests = ipRequests.get(ip) || [];
    const now = Date.now();
    const recentRequests = requests.filter(time => now - time < windowMs);

    return {
      requests: recentRequests.length,
      isBlacklisted: isIpBlacklisted(ip),
      isSuspicious: suspiciousIps.has(ip),
      resetTime: requests.length > 0 ? Math.max(...requests) + windowMs : 0
    };
  };

  /**
   * Cleans up old request records.
   */
  const cleanup = () => {
    const cutoffTime = Date.now() - windowMs;

    // Clean IP records
    for (const [ip, times] of ipRequests.entries()) {
      const validTimes = times.filter(time => time > cutoffTime);
      if (validTimes.length === 0) {
        ipRequests.delete(ip);
      } else {
        ipRequests.set(ip, validTimes);
      }
    }

    // Clean user records
    for (const [userId, times] of userRequests.entries()) {
      const validTimes = times.filter(time => time > cutoffTime);
      if (validTimes.length === 0) {
        userRequests.delete(userId);
      } else {
        userRequests.set(userId, validTimes);
      }
    }

    // Clean suspicious IPs (remove old ones)
    const suspiciousIpArray = Array.from(suspiciousIps);
    suspiciousIps.clear();
    suspiciousIpArray.forEach(ip => {
      const ipRequestTimes = ipRequests.get(ip) || [];
      const recentActivity = ipRequestTimes.filter(time => Date.now() - time < 300000); // 5 minutes
      if (recentActivity.length > 0) {
        suspiciousIps.add(ip);
      }
    });
  };

  // Start cleanup interval
  const cleanupInterval = setInterval(cleanup, windowMs);

  return {
    recordRequest,
    getIpStatus,
    isIpBlacklisted,
    isSuspiciousActivity,
    cleanup: () => {
      clearInterval(cleanupInterval);
      cleanup();
    }
  };
};

/**
 * Creates input validation utilities with security focus.
 */
export const createSecureValidator = () => {
  /**
   * Validates email with security considerations.
   */
  const validateSecureEmail = (email: any): { isValid: boolean; error?: string; normalized?: string } => {
    if (!TypeValidators.isNonEmptyString(email, { trim: true })) {
      return { isValid: false, error: 'Email is required' };
    }

    const sanitizedEmail = InputSanitizers.sanitizeEmail(email);
    
    if (!TypeValidators.isEmailString(sanitizedEmail)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /test/i,      // Common test accounts
      /admin/i,      // Admin accounts
      /noreply/i,    // No-reply accounts
      /\.info$/,     // Info domains often used for phishing
      /\.biz$/      // Business domains sometimes used for spam
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(sanitizedEmail));

    return {
      isValid: true,
      normalized: sanitizedEmail.toLowerCase(),
      ...(isSuspicious && { warning: 'Email contains suspicious patterns' })
    };
  };

  /**
   * Validates URL with security considerations.
   */
  const validateSecureUrl = (url: any): { isValid: boolean; error?: string; normalized?: string; security?: string[] } => {
    if (!TypeValidators.isNonEmptyString(url, { trim: true })) {
      return { isValid: false, error: 'URL is required' };
    }

    const sanitizedUrl = InputSanitizers.sanitizeUrl(url);
    
    if (!TypeValidators.isUrlString(sanitizedUrl)) {
      return { isValid: false, error: 'Invalid URL format' };
    }

    const securityWarnings: string[] = [];
    
    // Check for dangerous protocols
    if (sanitizedUrl.startsWith('javascript:') || sanitizedUrl.startsWith('data:')) {
      securityWarnings.push('Dangerous protocol detected');
    }

    // Check for suspicious domains
    const urlObj = new URL(sanitizedUrl);
    const suspiciousHosts = [
      'bit.ly', 'tinyurl.com', 'short.link',
      '0x0.st', 'pastebin.com'
    ];

    if (suspiciousHosts.some(host => urlObj.hostname.includes(host))) {
      securityWarnings.push('Suspicious URL shortener detected');
    }

    return {
      isValid: true,
      normalized: sanitizedUrl.toLowerCase(),
      security: securityWarnings
    };
  };

  /**
   * Validates file path for path traversal attacks.
   */
  const validateSecurePath = (path: any): { isValid: boolean; error?: string; sanitized?: string } => {
    if (!TypeValidators.isNonEmptyString(path, { trim: true })) {
      return { isValid: false, error: 'Path is required' };
    }

    let sanitizedPath = path.replace(/\\/g, '/'); // Normalize slashes
    sanitizedPath = sanitizedPath.replace(/\.\./g, ''); // Remove directory traversal
    sanitizedPath = sanitizedPath.replace(/\.\./g, '');
    sanitizedPath = sanitizedPath.replace(/[\/\\]/g, '/'); // Normalize to forward slashes

    // Additional security checks
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[\/\\]..\//, // Traversal with different slashes
      /^[\/\\]/, // Leading slash
      /[\/\\]$/ // Trailing slash
    ];

    const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(sanitizedPath));

    return {
      isValid: !hasDangerousPattern,
      ...(hasDangerousPattern && { error: 'Path contains dangerous patterns' }),
      sanitized: sanitizedPath
    };
  };

  return {
    validateSecureEmail,
    validateSecureUrl,
    validateSecurePath
  };
};

// Export security utilities
export const SecurityUtils = {
  createHtmlSanitizer,
  createCspBuilder,
  createSecureRateLimit,
  createSecureValidator
};

export default SecurityUtils;