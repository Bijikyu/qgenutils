/**
 * Security Headers Middleware
 *
 * PURPOSE: Provides comprehensive HTTP security headers to protect against
 * common web vulnerabilities including XSS, clickjacking, MIME-type sniffing,
 * and other client-side attacks. This middleware should be applied to all
 * HTTP responses to ensure robust security posture.
 *
 * SECURITY HEADERS IMPLEMENTED:
 * - Content-Security-Policy (CSP): Prevents XSS and code injection
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME-type sniffing
 * - X-XSS-Protection: Enables XSS filtering in legacy browsers
 * - Referrer-Policy: Controls referrer information leakage
 * - Permissions-Policy: Controls browser feature access
 * - Strict-Transport-Security: Enforces HTTPS connections
 * - Cross-Origin-Embedder-Policy: Controls cross-origin resource loading
 * - Cross-Origin-Opener-Policy: Controls cross-origin window access
 * - Cross-Origin-Resource-Policy: Controls cross-origin resource access
 *
 * ENVIRONMENTAL CONSIDERATIONS:
 * - Production: Strict security policies with HTTPS enforcement
 * - Development: Relaxed policies for local development and testing
 * - Testing: Configurable policies for different test scenarios
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Security headers configuration interface
 */
export interface SecurityHeadersConfig {
  /** Enable Content Security Policy */
  enableCSP?: boolean;
  /** Enable Strict Transport Security (HTTPS only) */
  enableHSTS?: boolean;
  /** Enable Cross-Origin policies */
  enableCORP?: boolean;
  /** Custom CSP directives */
  customCSP?: string;
  /** Environment mode for appropriate header values */
  environment?: 'development' | 'production' | 'test';
}

/**
 * Default security configuration
 */
const defaultConfig: SecurityHeadersConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableCORP: true,
  environment: 'production'
};

/**
 * Content Security Policy directives by environment
 */
const getCSPDirectives = (environment: string): string => {
  const baseDirectives = [
    'default-src \'self\'',
    'script-src \'self\'', // Removed unsafe-inline and unsafe-eval for security
    'style-src \'self\'', // Removed unsafe-inline for security
    'img-src \'self\' data: https:',
    'font-src \'self\' data:',
    'connect-src \'self\' https:', // Restrict to HTTPS only in production
    'frame-src \'none\'',
    'object-src \'none\'',
    'base-uri \'self\'',
    'form-action \'self\'',
    'frame-ancestors \'none\'',
    'upgrade-insecure-requests'
  ];

  if (environment === 'development') {
    baseDirectives.splice(1, 1, 'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' http://localhost:* ws://localhost:*'); // Replace script-src
    baseDirectives.splice(2, 1, 'style-src \'self\' \'unsafe-inline\''); // Replace style-src
    baseDirectives.splice(5, 1, 'connect-src \'self\' http://localhost:* ws://localhost:* https:'); // Replace connect-src
  }

  return baseDirectives.join('; ');
};

/**
 * Creates security headers middleware
 *
 * @param config - Security configuration options
 * @returns Express middleware function
 */
export const createSecurityHeaders = (config: SecurityHeadersConfig = {}):
  (req: Request, res: Response, next: NextFunction) => void => {

  const finalConfig = { ...defaultConfig, ...config };
  const { environment = 'production', enableCSP, enableHSTS, enableCORP, customCSP } = finalConfig;

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Content Security Policy
      if (enableCSP) {
        const cspValue = customCSP || getCSPDirectives(environment);
        res.setHeader('Content-Security-Policy', cspValue);
      }

      // X-Frame-Options - Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');

      // X-Content-Type-Options - Prevent MIME-type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // X-XSS-Protection - Enable XSS filtering (legacy browsers)
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Referrer-Policy - Control referrer leakage
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Permissions-Policy - Control browser feature access
      const permissionsPolicy = [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
        'autoplay=()',
        'encrypted-media=()',
        'fullscreen=(self)',
        'picture-in-picture=(self)'
      ].join(', ');
      res.setHeader('Permissions-Policy', permissionsPolicy);

      // Strict-Transport-Security - HTTPS enforcement (production only)
      if (enableHSTS && environment === 'production' && req.secure) {
        const hstsValue = 'max-age=31536000; includeSubDomains; preload';
        res.setHeader('Strict-Transport-Security', hstsValue);
      }

      // Cross-Origin Policies (if enabled)
      if (enableCORP) {
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
      }

      // Additional security headers
      res.setHeader('X-DNS-Prefetch-Control', 'off');
      res.setHeader('X-Download-Options', 'noopen');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      res.setHeader('X-Powered-By', ''); // Remove server fingerprinting

      // Cache control for API responses
      if (req.path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

    } catch (error) {
      // Log security middleware errors without exposing sensitive data
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        console.warn('Security headers middleware error:', error instanceof Error ? error.message : 'Unknown error');
      }
      // Continue without failing the request
    }

    next();
  };
};

/**
 * Pre-configured security middleware for different environments
 */
export const securityHeaders = {
  /** Production security middleware */
  production: createSecurityHeaders({ environment: 'production' }),

  /** Development security middleware */
  development: createSecurityHeaders({
    environment: 'development',
    enableHSTS: false // Disable HSTS in development
  }),

  /** Test security middleware */
  test: createSecurityHeaders({
    environment: 'test',
    enableHSTS: false,
    enableCORP: false // More permissive for testing
  })
};

/**
 * Default middleware that detects environment automatically
 */
export const securityMiddleware = createSecurityHeaders({
  environment: process.env.NODE_ENV as any || 'production'
});

export default securityMiddleware;
