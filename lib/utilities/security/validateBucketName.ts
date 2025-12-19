'use strict';

/**
 * Validates bucket name according to GCS/S3 naming rules
 * @param {string} bucketName - The bucket name to validate
 * @throws {Error} If bucket name is invalid
 * @example
 * validateBucketName('my-bucket-123'); // passes
 * validateBucketName('..invalid'); // throws
 */
function validateBucketName(bucketName) { // validate cloud storage bucket name
  if (!bucketName || typeof bucketName !== 'string') {
    throw new Error('Invalid bucket name: must be a non-empty string');
  }

  if (bucketName.length < 3 || bucketName.length > 63) { // length validation
    throw new Error('Bucket name must be between 3 and 63 characters');
  }

  const bucketNamePattern: any = /^[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$/; // GCS/S3 naming rules
  if (!bucketNamePattern.test(bucketName)) {
    throw new Error(`Invalid bucket name: "${bucketName}" does not conform to naming rules`);
  }

  const prohibitedPatterns = [ // additional prohibited patterns
    /^\./,           // cannot start with period
    /\.$/,           // cannot end with period
    /\.\./,          // cannot contain consecutive periods
    /^-/,            // cannot start with hyphen
    /-$/,            // cannot end with hyphen
    /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/ // cannot be IP address format
  ];

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(bucketName)) {
      throw new Error(`Bucket name contains prohibited pattern: "${bucketName}"`);
    }
  }
}

export default validateBucketName;
