'use strict';

const validateBucketName = require('./validateBucketName');
const validateObjectName = require('./validateObjectName');
const validateAndNormalizePath = require('./validateAndNormalizePath');

/**
 * Creates a safe object path by combining bucket and object names
 * Validates both components before combining
 * @param {string} bucketName - Bucket name to validate
 * @param {string} objectName - Object name to validate
 * @returns {string} Safe combined path
 * @throws {Error} If bucket or object name is invalid
 * @example
 * const path = createSafeObjectPath('my-bucket', 'images/photo.jpg');
 * // Returns: '/my-bucket/images/photo.jpg'
 */
function createSafeObjectPath(bucketName, objectName) { // create safe combined path
  validateBucketName(bucketName);
  validateObjectName(objectName);

  const safeObjectPath = validateAndNormalizePath(objectName, { allowLeadingSlash: false });

  return `/${bucketName}/${safeObjectPath}`;
}

module.exports = createSafeObjectPath;
