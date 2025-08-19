/**
 * Sanitize SQL Input to Prevent Injection Attacks
 * 
 * RATIONALE: SQL injection attacks can compromise entire databases.
 * This function provides basic input sanitization as a defense layer,
 * though parameterized queries should always be the primary protection.
 * 
 * SECURITY APPROACH:
 * - Remove dangerous SQL keywords and patterns
 * - Escape special characters that could break query structure
 * - Length limiting to prevent DoS attacks
 * - Logging for security monitoring
 * 
 * @param {string} input - Raw input that will be used in SQL context
 * @param {object} options - Sanitization options
 * @returns {string} Sanitized input safer for SQL usage
 * @throws Never throws - returns empty string on error (fail-secure)
 */

// 🔗 Tests: sanitizeSqlInput → SQL injection prevention → keyword filtering
// Defensive require for qerrors to prevent test environment failures
let qerrors;
try {
  const qerrorsModule = require('qerrors');
  qerrors = qerrorsModule && qerrorsModule.qerrors ? qerrorsModule.qerrors : (qerrorsModule && qerrorsModule.default) ? qerrorsModule.default : qerrorsModule;
} catch (err) {
  // Provide a no-op fallback so tests won't fail if qerrors is absent
  qerrors = function () { /* no-op error reporter for test envs */ };
}

const logger = require('../logger');
const localVars = require('../../config/localVars');

function sanitizeSqlInput(input, options = {}) {
  const { maxLength = localVars.MAX_STRING_LENGTH || 1000 } = options;

  try {
    if (typeof input !== `string` || input.length > maxLength) {
      logger.warn(`SQL input sanitization rejected oversized or invalid input`, {
        inputType: typeof input,
        inputLength: input?.length
      });
      return ``;
    }

    let sanitized = input;

    // Remove dangerous SQL patterns
    const dangerousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(\b(UNION|OR|AND)\b\s*\d+\s*=\s*\d+)/gi,
      /(--|\/\*|\*\/|;|'|"|`)/gi,
      /(\bSCRIPT\b)/gi
    ];

    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, ``);
    });

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, ``);

    logger.debug(`SQL input sanitization completed`, {
      originalLength: input.length,
      sanitizedLength: sanitized.length,
      patternsRemoved: input.length - sanitized.length
    });

    return sanitized.trim();

  } catch (error) {
    qerrors(error, `sanitizeSqlInput`, { input: input?.substring(0, 50) });
    logger.error(`SQL input sanitization failed`, { error: error.message });
    return ``; // Fail secure
  }
}

module.exports = sanitizeSqlInput;