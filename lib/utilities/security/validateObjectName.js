'use strict';

/**
 * Validates object name according to GCS/S3 rules
 * @param {string} objectName - The object name to validate
 * @param {Object} [options] - Configuration options
 * @param {number} [options.maxLength=1024] - Maximum object name length
 * @throws {Error} If object name is invalid
 * @example
 * validateObjectName('images/photo.jpg'); // passes
 * validateObjectName('..'); // throws
 */
function validateObjectName(objectName, options = {}) { // validate cloud storage object name
  const maxLength = options.maxLength || 1024;

  if (!objectName || typeof objectName !== 'string') {
    throw new Error('Invalid object name: must be a non-empty string');
  }

  if (objectName.length > maxLength) { // size limit
    throw new Error(`Object name too long: maximum ${maxLength} characters allowed`);
  }

  if (/[\x00-\x1F\x7F-\x9F]/.test(objectName)) { // control characters
    throw new Error('Object name contains disallowed characters');
  }

  if (/\r|\n/.test(objectName)) { // newline characters
    throw new Error('Object name contains disallowed characters');
  }

  const prohibitedNames = [ // specific prohibited values (GCS/Windows restrictions)
    '.', '..', '', 'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];

  if (prohibitedNames.includes(objectName.toUpperCase())) {
    throw new Error(`Object name cannot be "${objectName}"`);
  }
}

module.exports = validateObjectName;
