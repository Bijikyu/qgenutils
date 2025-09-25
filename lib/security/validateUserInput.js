/**
 * Validate and Sanitize Arbitrary User Input with Size Constraints
 * 
 * RATIONALE: User input can be arbitrarily large or deeply nested, potentially
 * causing memory exhaustion or processing delays. This function provides
 * bounded sanitization with configurable limits to prevent DoS attacks.
 * 
 * SECURITY APPROACH:
 * - Deep sanitization with maximum depth limits
 * - Memory budget tracking to prevent excessive allocations
 * - String length limits to prevent buffer overflow attacks
 * - Entry count limits to prevent hash collision DoS
 * - Graceful degradation with truncation markers
 * 
 * @param {any} input - User input to validate and sanitize
 * @param {object} options - Configuration options for validation limits
 * @returns {object} Validation result with sanitized data and status
 * @throws Never throws - returns error status on failure
 */

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
const sanitizeString = require('../utilities/string/sanitizeString');
const localVars = require('../../config/localVars');

// Default configuration constants
const MAX_DEPTH = 6;
const MAX_ENTRIES = 100;
const MAX_STRING = 8192;
const DEFAULT_BUDGET = 16 * 1024; // 16KB

function deepSanitizeClone(value, depth = 0, state = { remaining: DEFAULT_BUDGET }, options = {}) {
  const {
    maxDepth = MAX_DEPTH,
    maxEntries = MAX_ENTRIES,
    maxStringLength = MAX_STRING
  } = options;
  
  // Check budget and depth limits
  if (state.remaining <= 0) return '[truncated]';
  if (value == null) return value;
  if (depth > maxDepth) return '[truncated]';

  // Helper function to calculate byte length safely
  const byteLen = (s) => {
    try { 
      return Buffer.byteLength(s, 'utf8'); 
    } catch { 
      return s.length; 
    }
  };

  // Helper function to spend budget
  const spend = (n) => { 
    state.remaining -= n; 
    return state.remaining > 0; 
  };

  const valueType = typeof value;
  
  // Handle string values with length limits
  if (valueType === 'string') {
    const sanitized = sanitizeString(value);
    const clipped = sanitized.length > maxStringLength ? 
      sanitized.slice(0, maxStringLength) + '…' : sanitized;
    spend(byteLen(clipped));
    return clipped;
  }
  
  // Handle primitive values (numbers, booleans)
  if (valueType === 'number' || valueType === 'boolean') { 
    spend(8); 
    return value; 
  }
  
  // Handle arrays with entry limits
  if (Array.isArray(value)) {
    const output = [];
    const maxItems = Math.min(value.length, maxEntries);
    
    for (let i = 0; i < maxItems && state.remaining > 0; i++) {
      output.push(deepSanitizeClone(value[i], depth + 1, state, options));
    }
    
    if (value.length > maxItems && state.remaining > 0) {
      output.push('[…]');
    }
    
    spend(2); // Account for array structure overhead
    return output;
  }
  
  // Handle objects with key/value sanitization
  if (valueType === 'object') {
    const output = {};
    let entryCount = 0;
    
    for (const [key, val] of Object.entries(value)) {
      if (entryCount++ >= maxEntries || state.remaining <= 0) { 
        output['…'] = '[truncated]'; 
        break; 
      }
      
      const sanitizedKey = sanitizeString(key);
      spend(byteLen(sanitizedKey) + 2); // Key plus structure overhead
      output[sanitizedKey] = deepSanitizeClone(val, depth + 1, state, options);
    }
    
    return output;
  }
  
  // Handle functions, symbols, and other types by converting to string
  try { 
    const stringValue = String(value); 
    spend(byteLen(stringValue)); 
    return stringValue; 
  } catch { 
    return '[unserializable]'; 
  }
}

function validateUserInput(input, options = {}) {
  const {
    maxDepth = MAX_DEPTH,
    maxEntries = MAX_ENTRIES,
    maxStringLength = MAX_STRING,
    memoryBudget = DEFAULT_BUDGET
  } = options;

  logger.debug('validateUserInput: starting validation', {
    inputType: typeof input,
    isArray: Array.isArray(input),
    memoryBudget
  });

  // Handle null and undefined inputs
  if (input === null || input === undefined) {
    return { isValid: true, sanitized: input };
  }

  try {
    const state = { remaining: memoryBudget };
    const sanitized = deepSanitizeClone(input, 0, state, options);
    
    const result = {
      isValid: true,
      sanitized,
      memoryUsed: memoryBudget - state.remaining,
      truncated: state.remaining <= 0
    };

    logger.debug('validateUserInput: validation completed', {
      memoryUsed: result.memoryUsed,
      truncated: result.truncated,
      originalType: typeof input,
      sanitizedType: typeof sanitized
    });

    return result;

  } catch (error) {
    qerrors(error, 'validateUserInput', { 
      inputType: typeof input,
      isArray: Array.isArray(input),
      errorMessage: error.message
    });

    logger.error('validateUserInput failed with unexpected error', { 
      error: error.message,
      stack: error.stack,
      inputType: typeof input
    });

    return { 
      isValid: false, 
      sanitized: null, 
      error: 'Failed to sanitize input',
      memoryUsed: 0
    };
  }
}

module.exports = validateUserInput;