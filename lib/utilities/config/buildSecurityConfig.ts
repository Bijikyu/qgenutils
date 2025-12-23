/**
 * Build Security Configuration
 * 
 * Creates a comprehensive security configuration with encryption,
 * authentication, JWT, CORS, and rate limiting settings.
 * 
 * @param {object} [options] - Security configuration options
 * @returns {object} Validated security configuration
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
  const {
    encryptionEnabled = true,
    encryptionAlgorithm = 'aes-256-gcm',
    hashAlgorithm = 'sha256',
    sessionTimeout = 30 * 60 * 1000,
    maxLoginAttempts = 5,
    lockoutDuration = 15 * 60 * 1000,
    passwordMinLength = 8,
    passwordRequireUppercase = true,
    passwordRequireLowercase = true,
    passwordRequireNumbers = true,
    passwordRequireSpecialChars = true,
    jwtSecret = null,
    jwtExpiration = '1h',
    corsOrigins = ['*'],
    rateLimitEnabled = true,
    rateLimitWindowMs = 15 * 60 * 1000,
    rateLimitMax = 100,
    headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  } = options;

  if (sessionTimeout <= 0) { // validate timeouts
    throw new Error('Session timeout must be positive');
  }
  if (maxLoginAttempts <= 0) {
    throw new Error('Max login attempts must be positive');
  }
  if (passwordMinLength < 4) {
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
