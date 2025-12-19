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
function validateAndNormalizePath(inputPath, options = {}) { // validate path against traversal attacks
  const maxLength: any = options.maxLength || 512;
  const allowLeadingSlash: any = options.allowLeadingSlash || false;

  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path: must be a non-empty string');
  }

  const sanitizedPath: any = inputPath.replace(/[\x00-\x1F\x7F]/g, ''); // remove null bytes and control chars

  if (/\.\./.test(sanitizedPath)) { // check for parent directory traversal
    throw new Error('Path contains dangerous traversal patterns');
  }

  if (/\\/.test(sanitizedPath)) { // check for windows path separators
    throw new Error('Path contains dangerous traversal patterns');
  }

  const normalizedPath: any = path.normalize(sanitizedPath); // normalize using Node.js path

  if (normalizedPath.includes('..') || normalizedPath.includes('\\') || normalizedPath.includes('\0')) {
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
