/**
 * Build Rate Limit Key
 * 
 * Generates a unique key for rate limiting based on configurable strategies.
 * Supports IP-based, user-based, API key-based, and custom strategies.
 * 
 * @param {object} req - Request object
 * @param {object} [options] - Key generation options
 * @param {string} [options.strategy='ip'] - Strategy: 'ip', 'user', 'apiKey', or 'custom'
 * @param {string} [options.prefix='rl'] - Key prefix
 * @param {Function} [options.customKeyFn] - Custom key generator function
 * @param {string} [options.userIdPath='user.id'] - Path to user ID in request
 * @param {string} [options.apiKeyPath='validatedApiKey'] - Path to API key in request
 * @returns {string} Rate limit key
 */
function buildRateLimitKey(req, options = {}) {
  const {
    strategy = 'ip',
    prefix = 'rl',
    customKeyFn = null,
    userIdPath = 'user.id',
    apiKeyPath = 'validatedApiKey'
  } = options;

  let identifier = 'anonymous'; // fallback identifier

  switch (strategy) {
    case 'ip':
      identifier = req.ip || req.connection?.remoteAddress || 'unknown-ip'; // extract IP address
      break;

    case 'user':
      identifier = getNestedValue(req, userIdPath) || 'unknown-user'; // extract user ID
      break;

    case 'apiKey':
      const apiKey: any = req[apiKeyPath] || getNestedValue(req, apiKeyPath);
      identifier = apiKey ? hashKey(apiKey) : 'unknown-key'; // hash API key for privacy
      break;

    case 'custom':
      if (typeof customKeyFn === 'function') {
        identifier = customKeyFn(req) || 'custom-unknown';
      }
      break;

    default:
      identifier = req.ip || 'unknown';
  }

  return `${prefix}:${identifier}`; // return prefixed key
}

function getNestedValue(obj, path) { // helper to get nested property
  if (!obj || typeof path !== 'string') return undefined;
  const keys: any = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

function hashKey(key) { // simple hash for privacy
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char: any = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `key_${Math.abs(hash).toString(36)}`;
}

export default buildRateLimitKey;
