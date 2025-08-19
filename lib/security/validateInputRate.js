/**
 * Validate Input Rate to Prevent DoS and Brute Force Attacks
 * 
 * RATIONALE: Rate limiting is essential to prevent abuse and ensure
 * system availability. This function provides basic rate limiting
 * validation that can be integrated into input validation pipelines.
 * 
 * SECURITY APPROACH:
 * - Time-window based rate limiting
 * - Per-identifier tracking (IP, user, etc.)
 * - Configurable limits for different contexts
 * - Memory-efficient implementation for high throughput
 * 
 * @param {string} identifier - Unique identifier for rate limiting (IP, user ID, etc.)
 * @param {object} options - Rate limiting configuration
 * @returns {boolean} True if request is within limits, false if rate exceeded
 * @throws Never throws - returns false on any error (fail-secure)
 */

// 🔗 Tests: validateInputRate → rate limiting → DoS prevention
// Defensive require for qerrors to prevent test environment failures
let qerrors;
try {
  const qerrorsModule = require(`qerrors`);
  qerrors = qerrorsModule && qerrorsModule.qerrors ? qerrorsModule.qerrors : (qerrorsModule && qerrorsModule.default) ? qerrorsModule.default : qerrorsModule;
} catch (err) {
  // Provide a no-op fallback so tests won't fail if qerrors is absent
  qerrors = function () { /* no-op error reporter for test envs */ };
}

const logger = require(`../logger`);
const localVars = require(`../../config/localVars`);

// In-memory rate limiting store (for production, use Redis)
const rateStore = new Map();

function validateInputRate(identifier, options = {}) {
  const {
    windowMs = localVars.RATE_LIMIT_WINDOW || 60000, // 1 minute
    maxRequests = localVars.RATE_LIMIT_MAX_REQUESTS || 100
  } = options;

  try {
    if (typeof identifier !== `string` || !identifier.trim()) {
      logger.warn(`Rate validation received invalid identifier`, { 
        identifier, 
        identifierType: typeof identifier 
      });
      return false; // Fail secure
    }

    const now = Date.now();
    const key = identifier.trim();
    
    // Get or initialize rate data
    let rateData = rateStore.get(key) || { count: 0, windowStart: now };
    
    // Reset if window expired
    if (now - rateData.windowStart > windowMs) {
      rateData = { count: 0, windowStart: now };
    }
    
    // Check if limit exceeded
    if (rateData.count >= maxRequests) {
      logger.warn(`Rate limit exceeded`, { 
        identifier: key,
        currentCount: rateData.count,
        maxRequests,
        windowMs
      });
      return false;
    }
    
    // Increment counter and update store
    rateData.count++;
    rateStore.set(key, rateData);
    
    // Clean old entries periodically (simple cleanup)
    if (rateStore.size > 10000) { // Prevent memory bloat
      const cutoff = now - (windowMs * 2);
      for (const [k, v] of rateStore.entries()) {
        if (v.windowStart < cutoff) {
          rateStore.delete(k);
        }
      }
    }
    
    logger.debug(`Rate limit validation passed`, {
      identifier: key,
      currentCount: rateData.count,
      maxRequests
    });
    
    return true;

  } catch (error) {
    qerrors(error, `validateInputRate`, { identifier, options });
    logger.error(`Rate validation failed`, { error: error.message });
    return false; // Fail secure
  }
}

module.exports = validateInputRate;