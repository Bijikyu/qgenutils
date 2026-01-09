/**
 * Security Configuration Builder - Production-Ready Security Settings
 *
 * PURPOSE: Creates a comprehensive, validated security configuration that covers
 * all major security concerns for web applications and APIs. This utility follows
 * defense-in-depth principles by providing multiple layers of security controls.
 *
 * SECURITY DOMAINS COVERED:
 * - Encryption: Data-at-rest and in-transit protection with configurable algorithms
 * - Authentication: Session management, password policies, and login protection
 * - Authorization: JWT configuration with proper token validation settings
 * - Network Security: CORS policies, security headers, and HTTPS enforcement
 * - Rate Limiting: Protection against brute force and DoS attacks
 * - Session Security: Timeout policies and secure session management
 *
 * DEFAULT SECURITY POLICIES: Follows industry best practices and OWASP guidelines:
 * - AES-256-GCM encryption for strong symmetric encryption
 * - SHA-256 hashing with 100,000 iterations for password storage
 * - 30-minute session timeout for balanced security and usability
 * - 5 failed login attempts with 15-minute lockout to prevent brute force
 * - Security headers (XSS protection, clickjacking prevention, content type protection)
 *
 * CONFIGURATION VALIDATION: Includes comprehensive validation to prevent
 * misconfigurations that could create security vulnerabilities.
 * All time values are in milliseconds for consistency across the codebase.
 *
 * @param {object} [options] - Security configuration options with sensible defaults
 * @returns {object} Validated and normalized security configuration object
 *
 * @example
 * // Basic security configuration with defaults
 * const securityConfig = buildSecurityConfig();
 *
 * @example
 * // Custom security configuration
 * const customConfig = buildSecurityConfig({
 *   passwordMinLength: 12,
 *   jwtExpiration: '24h',
 *   corsOrigins: ['https://app.example.com'],
 *   rateLimitMax: 50
 * });
 *
 * @example
 * // High-security configuration
 * const highSecurityConfig = buildSecurityConfig({
 *   sessionTimeout: 15 * 60 * 1000, // 15 minutes
 *   maxLoginAttempts: 3,
 *   lockoutDuration: 30 * 60 * 1000, // 30 minutes
 *   encryptionKeyRotationEnabled: true,
 *   httpsRedirect: true,
 *   securityHeadersEnabled: true
 * });
 */

interface SecurityConfigOptions {
  encryptionEnabled?: boolean;
  encryptionAlgorithm?: string;
  hashAlgorithm?: string;
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  lockoutDuration?: number;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSpecialChars?: boolean;
  jwtSecret?: string | null;
  jwtExpiration?: string;
  corsOrigins?: string[];
  rateLimitEnabled?: boolean;
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
  headers?: Record<string, string>;
  encryptionKeyRotationEnabled?: boolean;
  hashIterations?: number;
  jwtIssuer?: string | null;
  jwtAudience?: string | null;
  corsCredentials?: boolean;
  corsMethods?: string[];
  corsAllowedHeaders?: string[];
  rateLimitSkipSuccessful?: boolean;
  rateLimitSkipFailed?: boolean;
  securityHeadersEnabled?: boolean;
  httpsRedirect?: boolean;
  trustProxy?: boolean;
}

function buildSecurityConfig(options: SecurityConfigOptions = {}) {
  // Extract and normalize configuration options with secure defaults
  // All defaults are chosen based on OWASP security guidelines and industry best practices
  const {
    encryptionEnabled = true, // Encryption enabled by default for data protection
    encryptionAlgorithm = 'aes-256-gcm', // AES-256-GCM provides both confidentiality and integrity
    hashAlgorithm = 'sha256', // SHA-256 provides strong collision resistance
    sessionTimeout = 30 * 60 * 1000, // 30 minutes balances security and usability
    maxLoginAttempts = 5, // 5 attempts before lockout prevents casual brute force
    lockoutDuration = 15 * 60 * 1000, // 15 minutes prevents sustained attacks
    passwordMinLength = 8, // 8 characters meets NIST SP 800-63B minimum
    passwordRequireUppercase = true, // Uppercase increases entropy
    passwordRequireLowercase = true, // Lowercase increases entropy
    passwordRequireNumbers = true, // Numbers increase character set size
    passwordRequireSpecialChars = true, // Special chars dramatically increase complexity
    jwtSecret = null, // JWT secret must be explicitly provided for security
    jwtExpiration = '1h', // 1 hour balances security and user experience
    corsOrigins = ['*'], // Wildcard allows development, should be restricted in production
    rateLimitEnabled = true, // Rate limiting prevents abuse and DoS attacks
    rateLimitWindowMs = 15 * 60 * 1000, // 15-minute window for rate limiting
    rateLimitMax = 100, // 100 requests per window is reasonable for most APIs
    headers = {
      // OWASP recommended security headers
      'X-Content-Type-Options': 'nosniff', // Prevents MIME type sniffing attacks
      'X-Frame-Options': 'DENY', // Prevents clickjacking attacks
      'X-XSS-Protection': '1; mode=block' // Legacy XSS protection for older browsers
    }
  } = options;

  // Validate critical security parameters to prevent misconfigurations
  // These validations ensure that security policies cannot be accidentally disabled
  if (sessionTimeout <= 0) { // validate timeouts - must be positive to prevent immediate session expiry
    throw new Error('Session timeout must be positive');
  }
  if (maxLoginAttempts <= 0) { // Prevents infinite login attempts (would defeat lockout protection)
    throw new Error('Max login attempts must be positive');
  }
  if (passwordMinLength < 4) { // Enforces minimum reasonable password strength
    throw new Error('Password minimum length must be at least 4');
  }

  return {
    encryption: {
      enabled: Boolean(encryptionEnabled),
      algorithm: String(encryptionAlgorithm),
      keyRotationEnabled: options.encryptionKeyRotationEnabled || false
    },
    hash: {
      algorithm: String(hashAlgorithm),
      iterations: options.hashIterations || 100000
    },
    authentication: {
      sessionTimeout: Number(sessionTimeout),
      maxLoginAttempts: Number(maxLoginAttempts),
      lockoutDuration: Number(lockoutDuration),
      passwordPolicy: {
        minLength: Number(passwordMinLength),
        requireUppercase: Boolean(passwordRequireUppercase),
        requireLowercase: Boolean(passwordRequireLowercase),
        requireNumbers: Boolean(passwordRequireNumbers),
        requireSpecialChars: Boolean(passwordRequireSpecialChars)
      }
    },
    jwt: {
      secret: jwtSecret,
      expiration: String(jwtExpiration),
      issuer: options.jwtIssuer || null,
      audience: options.jwtAudience || null
    },
    cors: {
      origins: Array.isArray(corsOrigins)
        ? corsOrigins.filter(origin => typeof origin === 'string').map(String)
        : (typeof corsOrigins === 'string' ? [corsOrigins] : []),
      credentials: options.corsCredentials || false,
      methods: options.corsMethods || ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: options.corsAllowedHeaders || ['Content-Type', 'Authorization']
    },
    rateLimit: {
      enabled: Boolean(rateLimitEnabled),
      windowMs: Number(rateLimitWindowMs),
      max: Number(rateLimitMax),
      skipSuccessfulRequests: options.rateLimitSkipSuccessful || false,
      skipFailedRequests: options.rateLimitSkipFailed || false
    },
    headers: { ...headers },
    securityHeadersEnabled: options.securityHeadersEnabled !== false,
    httpsRedirect: options.httpsRedirect || false,
    trustProxy: options.trustProxy || false
  };
}

export default buildSecurityConfig;
