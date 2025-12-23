import * as crypto from 'crypto';

interface RateLimitOptions {
  strategy?: 'ip' | 'user' | 'apiKey' | 'custom';
  prefix?: string;
  customKeyFn?: (req: any) => string;
  userIdPath?: string;
  apiKeyPath?: string;
}

interface RequestObject {
  ip?: string;
  connection?: {
    remoteAddress?: string;
  };
  [key: string]: any;
}

/**
 * Build Rate Limit Key
 * 
 * Generates a unique key for rate limiting based on configurable strategies.
 * Supports IP-based, user-based, API key-based, and custom strategies.
 * 
 * @param {RequestObject} req - Request object
 * @param {RateLimitOptions} [options={}] - Key generation options
 * @param {string} [options.strategy='ip'] - Strategy: 'ip', 'user', 'apiKey', or 'custom'
 * @param {string} [options.prefix='rl'] - Key prefix
 * @param {Function} [options.customKeyFn] - Custom key generator function
 * @param {string} [options.userIdPath='user.id'] - Path to user ID in request
 * @param {string} [options.apiKeyPath='validatedApiKey'] - Path to API key in request
 * @returns {string} Rate limit key
 */
function buildRateLimitKey(req: RequestObject, options: RateLimitOptions = {}): string {
  // Input validation
  if (!req || typeof req !== 'object') {
    throw new Error('Request object is required and must be an object');
  }

  const {
    strategy = 'ip',
    prefix = 'rl',
    customKeyFn,
    userIdPath = 'user.id',
    apiKeyPath = 'validatedApiKey'
  } = options;

  let identifier = 'anonymous'; // fallback identifier

  switch (strategy) {
    case 'ip':
      // Safe property access with proper null checks
      identifier = req.ip || 
                   (req.connection && typeof req.connection === 'object' && req.connection.remoteAddress) || 
                   'unknown-ip';
      break;

    case 'user':
      identifier = getNestedValue(req, userIdPath) || 'unknown-user';
      break;

    case 'apiKey':
      const apiKey = req[apiKeyPath] || getNestedValue(req, apiKeyPath);
      identifier = apiKey ? hashKey(apiKey) : 'unknown-key';
      break;

    case 'custom':
      if (typeof customKeyFn === 'function') {
        try {
          const customResult = customKeyFn(req);
          identifier = customResult || 'custom-unknown';
        } catch (error) {
          identifier = 'custom-error';
        }
      }
      break;

    default:
      identifier = req.ip || 'unknown';
  }

  return `${prefix}:${identifier}`;
}

function getNestedValue(obj: any, path: string): any { // helper to get nested property
  if (!obj || typeof path !== 'string') return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

function hashKey(key: string): string { // secure hash for privacy using crypto
  try {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return `key_${hash.substring(0, 16)}`;
  } catch (error) {
    // Fallback to simple hash if crypto fails
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `key_${Math.abs(hash).toString(36)}`;
  }
}

export default buildRateLimitKey;
