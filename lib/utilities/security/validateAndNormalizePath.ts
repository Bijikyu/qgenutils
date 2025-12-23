'use strict';

const path: any = require('path');

/**
 * Validates and sanitizes a file path to prevent directory traversal attacks
 * @param {string} inputPath - The raw input path to validate
 * @param {Object} [options] - Configuration options
 * @param {number} [options.maxLength=512] - Maximum path length allowed
 * @param {boolean} [options.allowLeadingSlash=false] - Allow paths starting with /
 * @returns {string} Normalized and safe path
 * @throws {Error} If path is invalid or contains traversal patterns
 * @example
 * const safePath: any = validateAndNormalizePath('uploads/image.png');
 * // Throws on '../../../etc/passwd'
 */
function validateAndNormalizePath(inputPath: string, options: { maxLength?: number; allowLeadingSlash?: boolean } = {}) { // validate path against traversal attacks
  const maxLength: number = options.maxLength || 512;
  const allowLeadingSlash: boolean = options.allowLeadingSlash || false;

  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path: must be a non-empty string');
  }

  // Remove control characters BEFORE decoding to prevent malformed decoding
  const cleanPath: string = inputPath.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Decode URL-encoded variants to catch encoded traversal attempts
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(cleanPath);
  } catch (error) {
    throw new Error('Path contains invalid URL encoding');
  }

  const sanitizedPath: string = decodedPath; // already cleaned above

  // Check for traversal patterns using string-based checks to avoid ReDoS
  // Check both original and lowercase to catch all encoding variations
  const dangerousPatterns = [
    '..',                     // Basic traversal
    '%2e%2e%2f',           // URL-encoded forward slash (lowercase)
    '%2E%2E%2F',           // URL-encoded forward slash (uppercase)
    '%2e%2e%5c',           // URL-encoded backslash (lowercase)
    '%2E%2E%5C',           // URL-encoded backslash (uppercase)
    '%2e%2e/',             // Mixed encoding (lowercase)
    '%2E%2E/',             // Mixed encoding (uppercase)
    '%2e%2e\\',            // Mixed encoding with backslash (lowercase)
    '%2E%2E\\',            // Mixed encoding with backslash (uppercase)
    '../',                  // With forward slash
    '..\\',                 // With backslash
  ];

  // Check both original and case variations
  const checkPath = (path: string) => {
    for (const pattern of dangerousPatterns) {
      if (path.includes(pattern)) {
        throw new Error('Path contains dangerous traversal patterns');
      }
    }
  };
  
  checkPath(sanitizedPath);
  checkPath(sanitizedPath.toLowerCase());
  checkPath(sanitizedPath.toUpperCase());

  if (/\\/.test(sanitizedPath)) { // check for windows path separators
    throw new Error('Path contains dangerous traversal patterns');
  }

  const normalizedPath: string = path.normalize(sanitizedPath); // normalize using Node.js path

  // Enhanced post-normalization checks
  if (normalizedPath.includes('..') || 
      normalizedPath.includes('\\') || 
      normalizedPath.includes('\0') ||
      normalizedPath.includes('%2e') ||
      normalizedPath.includes('%2E')) {
    throw new Error('Normalized path contains dangerous characters');
  }

  if (normalizedPath.startsWith('../') || normalizedPath.startsWith('..\\')) { // check post-normalization traversal
    throw new Error('Path attempts directory traversal');
  }

  if (!allowLeadingSlash && /^[/\\]/.test(normalizedPath)) { // check leading slashes
    throw new Error('Path cannot start with a slash');
  }

  if (normalizedPath.length > maxLength) { // prevent buffer overflow
    throw new Error(`Path too long: maximum ${maxLength} characters allowed`);
  }

  return normalizedPath;
}

export default validateAndNormalizePath;
