/**
 * Secure Cryptography Utilities
 * 
 * Provides secure cryptographic functions following modern best practices.
 * Simplified implementation focused on security and compatibility.
 */

/**
 * Password hashing configuration
 */
interface PasswordHashConfig {
  iterations?: number;
  keyLength?: number;
  saltLength?: number;
}

/**
 * JWT token configuration
 */
interface JwtConfig {
  algorithm?: string;
  issuer?: string;
  audience?: string;
  expiresIn?: string;
}

/**
 * Encryption configuration
 */
interface EncryptionConfig {
  keyLength?: number;
  ivLength?: number;
}

/**
 * Default secure configurations
 */
const DEFAULT_PASSWORD_CONFIG: Required<PasswordHashConfig> = {
  iterations: 100000, // OWASP recommendation
  keyLength: 32,      // 256 bits
  saltLength: 16      // 128 bits
};

const DEFAULT_JWT_CONFIG: JwtConfig = {
  algorithm: 'HS256',
  expiresIn: '1h'
};

const DEFAULT_ENCRYPTION_CONFIG: Required<EncryptionConfig> = {
  keyLength: 32,  // 256 bits
  ivLength: 12    // 96 bits
};

/**
 * Generates a cryptographically secure random salt
 * @param length - Salt length in bytes
 * @returns Base64 encoded salt
 */
async function generateSalt(length: number = 16): Promise<string> {
  try {
    const crypto = await import('crypto');
    const buffer = crypto.randomBytes(length);
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    // Fallback for environments without Node.js crypto
    const buffer = new Uint8Array(length);
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(buffer);
    } else {
      throw new Error('No secure random number generator available');
    }
    return btoa(String.fromCharCode(...buffer)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}

/**
 * Hashes a password using PBKDF2
 * @param password - Password to hash
 * @param salt - Salt (if not provided, generates new salt)
 * @param config - Hash configuration
 * @returns Object with hash and salt
 */
async function hashPassword(
  password: string, 
  salt?: string, 
  config: Partial<PasswordHashConfig> = {}
): Promise<{ hash: string; salt: string }> {
  const hashConfig = { ...DEFAULT_PASSWORD_CONFIG, ...config };
  
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  
  // Generate salt if not provided
  const saltValue = salt || await generateSalt(hashConfig.saltLength);
  const saltBuffer = Buffer.from(saltValue, 'base64');
  
  try {
    const crypto = await import('crypto');
    const derivedKey = crypto.pbkdf2Sync(
      password,
      saltBuffer,
      hashConfig.iterations,
      hashConfig.keyLength,
      'sha256'
    );
    
    return {
      hash: derivedKey.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
      salt: saltValue
    };
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verifies a password against a hash
 * @param password - Password to verify
 * @param hash - Stored hash
 * @param salt - Stored salt
 * @param config - Hash configuration
 * @returns True if password matches
 */
async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
  config: Partial<PasswordHashConfig> = {}
): Promise<boolean> {
  try {
    const { hash: computedHash } = await hashPassword(password, salt, config);
    return constantTimeCompare(hash, computedHash);
  } catch {
    return false;
  }
}

/**
 * Constant-time comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function constantTimeCompare(a: string, b: string): boolean {
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
 * Generates a secure random key for encryption
 * @param length - Key length in bytes
 * @returns Base64 encoded key
 */
async function generateEncryptionKey(length: number = 32): Promise<string> {
  try {
    const crypto = await import('crypto');
    const buffer = crypto.randomBytes(length);
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    // Fallback for environments without Node.js crypto
    const buffer = new Uint8Array(length);
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(buffer);
    } else {
      throw new Error('No secure random number generator available');
    }
    return btoa(String.fromCharCode(...buffer)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}

/**
 * Encrypts data using AES-256-GCM
 * @param data - Data to encrypt
 * @param key - Encryption key (base64)
 * @returns Object with encrypted data, IV, and auth tag
 */
async function encrypt(data: string, key: string): Promise<{ encrypted: string; iv: string; tag: string }> {
  if (!data || typeof data !== 'string') {
    throw new Error('Data must be a non-empty string');
  }
  
  const encConfig = { ...DEFAULT_ENCRYPTION_CONFIG };
  
  try {
    const crypto = await import('crypto');
    const keyBuffer = Buffer.from(key + '===', 'base64'); // Add padding for base64
    const ivBuffer = crypto.randomBytes(encConfig.ivLength);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
      iv: ivBuffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
      tag: tag.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    };
  } catch (error) {
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data using AES-256-GCM
 * @param encryptedData - Encrypted data object
 * @param key - Decryption key (base64)
 * @returns Decrypted string
 */
async function decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): Promise<string> {
  if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.tag) {
    throw new Error('Invalid encrypted data format');
  }
  
  try {
    const crypto = await import('crypto');
    const keyBuffer = Buffer.from(key + '===', 'base64'); // Add padding for base64
    
    // Convert back from URL-safe base64
    const encrypted = encryptedData.encrypted.replace(/-/g, '+').replace(/_/g, '/');
    const iv = Buffer.from(encryptedData.iv + '===', 'base64');
    const tag = Buffer.from(encryptedData.tag + '===', 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Creates a simple JWT token (for educational purposes - use library in production)
 * @param payload - JWT payload
 * @param secret - Secret key
 * @param config - JWT configuration
 * @returns JWT token
 */
async function createJwt(
  payload: Record<string, any>,
  secret: string,
  config: Partial<JwtConfig> = {}
): Promise<string> {
  const jwtConfig = { ...DEFAULT_JWT_CONFIG, ...config };
  
  const header = {
    alg: jwtConfig.algorithm,
    typ: 'JWT'
  };
  
  const jwtPayload: any = {
    ...payload,
    iat: Math.floor(Date.now() / 1000)
  };
  
  if (jwtConfig.issuer) {
    jwtPayload.iss = jwtConfig.issuer;
  }
  
  if (jwtConfig.audience) {
    jwtPayload.aud = jwtConfig.audience;
  }
  
  if (jwtConfig.expiresIn) {
    jwtPayload.exp = Math.floor(Date.now() / 1000) + parseExpiration(jwtConfig.expiresIn);
  }
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
  
  const message = `${encodedHeader}.${encodedPayload}`;
  
  // Create signature
  const signature = await signMessage(message, secret);
  
  return `${message}.${signature}`;
}

/**
 * Base64 URL-safe encoding
 * @param str - String to encode
 * @returns Base64 URL-safe encoded string
 */
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Parses expiration time string
 * @param expiresIn - Expiration string (e.g., '1h', '30m', '7d')
 * @returns Seconds until expiration
 */
function parseExpiration(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiration format');
  }
  
  const [, amount, unit] = match;
  const multiplier = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };
  
  return parseInt(amount) * multiplier[unit as keyof typeof multiplier];
}

/**
 * Signs a message using HMAC-SHA256
 * @param message - Message to sign
 * @param secret - Secret key
 * @returns Base64 URL-safe encoded signature
 */
async function signMessage(message: string, secret: string): Promise<string> {
  try {
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    throw new Error('Failed to sign message');
  }
}

/**
 * Validates input for potential security issues
 * @param input - Input to validate
 * @returns True if input is safe
 */
function isSecureInput(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  // Check for common injection patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i, // SQL injection
    /[;&|`$(){}\[\]]/, // Command injection
    /\.\./, // Path traversal
    /\/etc\/passwd|\/etc\/shadow/, // System file access
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Generates a secure random string for tokens, IDs, etc.
 * @param length - Length of random string
 * @returns Secure random string
 */
function generateSecureRandom(length: number = 32): string {
  if (length <= 0 || length > 1024) {
    throw new Error('Length must be between 1 and 1024');
  }
  
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsetLength = charset.length;
  
  // Helper function to build result from random bytes
  const buildRandomString = (randomValues: Uint8Array | Buffer): string => {
    const resultArray = new Array(length);
    for (let i = 0; i < length; i++) {
      resultArray[i] = charset[randomValues[i] % charsetLength];
    }
    return resultArray.join('');
  };
  
  try {
    // Use Node.js crypto if available
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(length);
    return buildRandomString(randomBytes);
  } catch (error) {
    // Fallback to browser crypto
    const buffer = new Uint8Array(length);
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(buffer);
      return buildRandomString(buffer);
    } else {
      // Last resort - less secure Math.random()
      const randomValues = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * 256);
      }
      return buildRandomString(randomValues);
    }
  }
}

export {
  PasswordHashConfig,
  JwtConfig,
  EncryptionConfig,
  hashPassword,
  verifyPassword,
  generateSalt,
  generateEncryptionKey,
  encrypt,
  decrypt,
  createJwt,
  generateSecureRandom,
  signMessage,
  constantTimeCompare,
  isSecureInput
};