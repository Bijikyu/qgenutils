'use strict';

import validateBucketName from './validateBucketName.js';
import validateObjectName from './validateObjectName.js';
import validateAndNormalizePath from './validateAndNormalizePath.js';

/**
 * Creates a safe object path by combining bucket and object names
 * Validates both components before combining
 * @param {string} bucketName - Bucket name to validate
 * @param {string} objectName - Object name to validate
 * @returns {string} Safe combined path
 * @throws {Error} If bucket or object name is invalid
 * @example
 * const path: any = createSafeObjectPath('my-bucket', 'images/photo.jpg');
 * // Returns: '/my-bucket/images/photo.jpg'
 */
function createSafeObjectPath(bucketName, objectName) { // create safe combined path
  validateBucketName(bucketName);
  validateObjectName(objectName);

  const safeObjectPath: any = validateAndNormalizePath(objectName, { allowLeadingSlash: false });

  return `/${bucketName}/${safeObjectPath}`;
}

export default createSafeObjectPath;
