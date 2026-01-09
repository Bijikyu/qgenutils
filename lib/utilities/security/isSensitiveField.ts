'use strict';

import sanitizeLogValue from './sanitizeLogValue.js';
import sanitizeObject from './sanitizeObject.js';

/**
 * Determines if a field name suggests sensitive information
 * @param {string} fieldName - The field name to check
 * @returns {boolean} True if field appears sensitive
 * @example
 * isSensitiveField('password'); // true
 * isSensitiveField('username'); // false
 * isSensitiveField('apiKey'); // true
 */
function isSensitiveField(fieldName) { // check if field name is sensitive
  if (!fieldName || typeof fieldName !== 'string') {
    return false;
  }

  const lowerFieldName: any = fieldName.toLowerCase();

  const isRedactedField = sanitizeObject.REDACTED_FIELDS.some(field =>
    lowerFieldName === field.toLowerCase() || lowerFieldName.includes(field.toLowerCase())
  );

  if (isRedactedField) {
    return true;
  }

  const matchesSensitivePattern = sanitizeLogValue.SENSITIVE_PATTERNS.some(pattern =>
    pattern.test(lowerFieldName)
  );

  return matchesSensitivePattern;
}

export default isSensitiveField;
