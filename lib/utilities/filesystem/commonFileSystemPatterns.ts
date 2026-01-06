/**
 * Common File System and Path Utilities
 * 
 * Centralized file system and path utilities to eliminate code duplication across
 * codebase. These utilities handle common patterns including
 * path manipulation, file operations, security validation, and directory traversal.
 */

import { handleError } from '../error/commonErrorHandling.js';
import { validateAndTrimString, validateType } from '../validation/commonValidation.js';

/**
 * Path manipulation utilities
 */
export const PathUtils = {
  /**
   * Joins path segments safely
   */
  join: (...segments: string[]): string => {
    return segments
      .filter(segment => segment != null && segment !== undefined && segment !== '')
      .map(segment => segment.replace(/\\/g, '/'))
      .join('/');
  },

  /**
   * Normalizes path by removing redundant separators
   */
  normalize: (path: string): string => {
    return path.replace(/\/+/g, '/');
  },

  /**
   * Gets directory name from path
   */
  dirname: (path: string): string => {
    if (!path) return '';
    const lastSlash = path.lastIndexOf('/');
    return lastSlash >= 0 ? path.substring(0, lastSlash) : path;
  },

  /**
   * Gets base name from path
   */
  basename: (path: string): string => {
    if (!path) return '';
    const lastSlash = path.lastIndexOf('/');
    const filename = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
    const lastDot = filename.lastIndexOf('.');
    return lastDot >= 0 ? filename.substring(0, lastDot) : filename;
  },

  /**
   * Gets file extension from path
   */
  extname: (path: string): string => {
    const basename = PathUtils.basename(path);
    const lastDot = basename.lastIndexOf('.');
    return lastDot >= 0 ? basename.substring(lastDot) : '';
  },

  /**
   * Gets file name without extension
   */
  name: (path: string): string => {
    const basename = PathUtils.basename(path);
    const lastDot = basename.lastIndexOf('.');
    return lastDot >= 0 ? basename.substring(0, lastDot) : basename;
  },

  /**
   * Resolves relative path to absolute
   */
  resolve: (...paths: string[]): string => {
    let result = '';
    for (const path of paths) {
      if (!path) continue;
      if (path.startsWith('/')) {
        result = path;
      } else {
        result = PathUtils.normalize(result + '/' + path);
      }
    }
    return result;
  },

  /**
   * Gets relative path from absolute paths
   */
  relative: (from: string, to: string): string => {
    const fromParts = from.split('/').filter(Boolean);
    const toParts = to.split('/').filter(Boolean);
    
    // Find common prefix
    let commonLength = 0;
    for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
      if (fromParts[i] === toParts[i]) {
        commonLength++;
      } else {
        break;
      }
    }
    
    const fromCommon = fromParts.slice(commonLength).join('/');
    const fromRemaining = fromParts.slice(commonLength).join('/');
    const toRemaining = toParts.slice(commonLength).join('/');
    
    const upLevels = fromRemaining.split('/').filter(() => true).map(() => '..').length;
    const downLevels = toRemaining.split('/').filter(() => true).map(() => '..').length;
    
    const relativeLevels = upLevels - downLevels;
    const relativePrefix = Array(Math.max(0, relativeLevels)).fill('..').join('/');
    
    return PathUtils.normalize(relativePrefix + '/' + toRemaining);
  }
};

/**
 * File name security utilities
 */
export const FileNameUtils = {
  /**
   * Dangerous filename characters
   */
  DANGEROUS_CHARS: RegExp = /[<>:"|?*\/\\x00-\\x1f]/,

  /**
   * Reserved names (Windows)
   */
  RESERVED_NAMES: Set<string> = new Set([
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ]),

  /**
   * Validates filename for security
   */
  validate: (filename: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!filename || typeof filename !== 'string') {
      errors.push('Filename is required and must be a string');
      return { isValid: false, errors };
    }
    
    // Check for dangerous characters
    if (FileNameUtils.DANGEROUS_CHARS.test(filename)) {
      errors.push('Filename contains dangerous characters');
    }
    
    // Check for reserved names
    const nameWithoutExt = PathUtils.name(filename).toUpperCase();
    const ext = PathUtils.extname(filename).toUpperCase();
    
    if (FileNameUtils.RESERVED_NAMES.has(nameWithoutExt) || 
        (nameWithoutExt.startsWith('COM') && nameWithoutExt.length === 4 && ext === '')) {
      errors.push('Filename uses reserved name');
    }
    
    // Check length limits
    if (filename.length > 255) {
      errors.push('Filename exceeds maximum length of 255 characters');
    }
    
    // Check for empty name
    if (PathUtils.name(filename).length === 0) {
      errors.push('Filename cannot be empty');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Sanitizes filename by removing dangerous characters
   */
  sanitize: (filename: string): string => {
    return filename
      .replace(FileNameUtils.DANGEROUS_CHARS, '_')
      .replace(/\s+/g, '_')
      .substring(0, 200); // Limit length
  },

  /**
   * Generates safe filename from input
   */
  generateSafe: (input: string, extension?: string): string => {
    const sanitized = FileNameUtils.sanitize(input);
    const timestamp = Date.now().toString(36);
    const name = `${sanitized}_${timestamp}`;
    return extension ? `${name}.${extension}` : name;
  }
};

/**
 * File path security utilities
 */
export const SecurityUtils = {
  /**
   * Dangerous paths patterns
   */
  DANGEROUS_PATTERNS: RegExp[] = [
    /\.\./,  // Directory traversal
    /\.\.\\/, // Windows directory traversal
    /\//,  // Double slashes
    /[<>:"|?*]/, // Command injection
    /[\x00-\x1f]/, // Control characters
    /^[a-zA-Z]:/,  // Windows drive letters
    /\/etc\/(passwd|shadow|hosts)/i, // System files
    /\/(bin|sbin)\//i  // System binaries
  ],

  /**
   * Validates path for security
   */
  validatePath: (path: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!validateAndTrimString(path)) {
      errors.push('Path is required');
      return { isValid: false, errors };
    }
    
    // Check for dangerous patterns
    for (const pattern of SecurityUtils.DANGEROUS_PATTERNS) {
      if (pattern.test(path)) {
        errors.push(`Path contains dangerous pattern: ${pattern.source}`);
      }
    }
    
    // Check for absolute path manipulation
    if (path.startsWith('..') || path.includes('../')) {
      errors.push('Path attempts directory traversal');
    }
    
    // Check for control characters
    if (/[\x00-\x1f]/.test(path)) {
      errors.push('Path contains control characters');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Normalizes path by removing dangerous elements
   */
  normalizePath: (path: string): string => {
    // Remove dangerous characters
    let normalized = path.replace(/[\x00-\x1f]/g, '');
    
    // Normalize path separators
    normalized = normalized.replace(/\\/g, '/');
    
    // Remove directory traversal attempts
    normalized = normalized.replace(/\.\./g, '');
    
    // Remove leading/trailing slashes
    normalized = normalized.replace(/^\/+|\/+$/g, '');
    
    return normalized;
  }
};

/**
 * Directory operations utilities
 */
export const DirectoryUtils = {
  /**
   * Creates directory recursively if it doesn't exist
   */
  ensureDir: async (dirPath: string): Promise<void> => {
    try {
      // Use Node.js fs module would be ideal here
      // This is a placeholder - actual implementation would use fs.mkdirSync with recursive: true
      console.log(`Would create directory: ${dirPath}`);
    } catch (error) {
      handleError(error, 'DirectoryUtils.ensureDir', `Failed to ensure directory: ${dirPath}`);
      throw error;
    }
  },

  /**
   * Checks if directory exists
   */
  exists: async (dirPath: string): Promise<boolean> => {
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would check if directory exists: ${dirPath}`);
      return false;
    } catch (error) {
      handleError(error, 'DirectoryUtils.exists', `Failed to check directory: ${dirPath}`);
      return false;
    }
  },

  /**
   * Lists directory contents
   */
  list: async (dirPath: string): Promise<string[]> => {
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would list directory contents: ${dirPath}`);
      return [];
    } catch (error) {
      handleError(error, 'DirectoryUtils.list', `Failed to list directory: ${dirPath}`);
      throw error;
    }
  },

  /**
   * Removes directory recursively
   */
  remove: async (dirPath: string): Promise<void> => {
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would remove directory: ${dirPath}`);
    } catch (error) {
      handleError(error, 'DirectoryUtils.remove', `Failed to remove directory: ${dirPath}`);
      throw error;
    }
  }
};

/**
 * File operations utilities
 */
export const FileUtils = {
  /**
   * Reads file safely with error handling
   */
  read: async (filePath: string, options: {
    encoding?: BufferEncoding;
    maxSize?: number;
  } = {}): Promise<string | Buffer> => {
    const { encoding = 'utf8', maxSize = 1024 * 1024 } = options;
    
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would read file: ${filePath}`);
      return '';
    } catch (error) {
      handleError(error, 'FileUtils.read', `Failed to read file: ${filePath}`);
      throw error;
    }
  },

  /**
   * Writes file safely with directory creation
   */
  write: async (filePath: string, data: string | Buffer, options: {
    encoding?: BufferEncoding;
    createDir?: boolean;
  } = {}): Promise<void> => {
    const { encoding = 'utf8', createDir = true } = options;
    
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would write file: ${filePath}`);
    } catch (error) {
      handleError(error, 'FileUtils.write', `Failed to write file: ${filePath}`);
      throw error;
    }
  },

  /**
   * Appends to file safely
   */
  append: async (filePath: string, data: string): Promise<void> => {
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would append to file: ${filePath}`);
    } catch (error) {
      handleError(error, 'FileUtils.append', `Failed to append to file: ${filePath}`);
      throw error;
    }
  },

  /**
   * Checks if file exists
   */
  exists: async (filePath: string): Promise<boolean> => {
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would check if file exists: ${filePath}`);
      return false;
    } catch (error) {
      handleError(error, 'FileUtils.exists', `Failed to check if file exists: ${filePath}`);
      return false;
    }
  },

  /**
   * Gets file size
   */
  size: async (filePath: string): Promise<number> => {
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would get file size: ${filePath}`);
      return 0;
    } catch (error) {
      handleError(error, 'FileUtils.size', `Failed to get file size: ${filePath}`);
      return 0;
    }
  },

  /**
   * Deletes file safely
   */
  delete: async (filePath: string): Promise<void> => {
    try {
      // Use Node.js fs module would be ideal here
      console.log(`Would delete file: ${filePath}`);
    } catch (error) {
      handleError(error, 'FileUtils.delete', `Failed to delete file: ${filePath}`);
      throw error;
    }
  }
};

/**
 * Temporary file utilities
 */
export const TempUtils = {
  /**
   * Creates temporary file with unique name
   */
  createTemp: (prefix?: string, suffix?: string): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const tempName = `${prefix || 'temp'}_${timestamp}_${random}${suffix || '.tmp'}`;
    return tempName;
  },

  /**
   * Gets temporary directory
   */
  getTempDir: (): string => {
    // Common temp directories
    const tempDirs = ['/tmp', '/var/tmp', '/temp'];
    
    // Check which directory exists and is writable
    for (const tempDir of tempDirs) {
      // In a real implementation, we would check if directory exists and is writable
      console.log(`Would check temp directory: ${tempDir}`);
      return tempDir;
    }
    
    return '/tmp'; // Default fallback
  },

  /**
   * Creates temporary file with content
   */
  createTempFile: async (content: string, options: {
    prefix?: string;
    suffix?: string;
    encoding?: BufferEncoding;
  } = {}): Promise<string> => {
    const { prefix = 'temp', suffix = '.tmp' } = options;
    const tempName = TempUtils.createTemp(prefix, suffix);
    const tempPath = PathUtils.join(TempUtils.getTempDir(), tempName);
    
    try {
      console.log(`Would create temp file: ${tempPath}`);
      return tempPath;
    } catch (error) {
      handleError(error, 'TempUtils.createTempFile', `Failed to create temp file: ${tempPath}`);
      throw error;
    }
  }
};

/**
 * Combined path and file utilities
 */
export const PathFileUtils = {
  /**
   * Ensures directory exists for file path
   */
  ensureDirForFile: async (filePath: string): Promise<void> => {
    const dirPath = PathUtils.dirname(filePath);
    await DirectoryUtils.ensureDir(dirPath);
  },

  /**
   * Gets file extension safely
   */
  getFileExtension: (filePath: string): string => {
    const ext = PathUtils.extname(filePath);
    return ext.startsWith('.') ? ext.substring(1) : ext;
  },

  /**
   * Changes file extension
   */
  changeFileExtension: (filePath: string, newExtension: string): string => {
    const name = PathUtils.name(filePath);
    const baseDir = PathUtils.dirname(filePath);
    return PathUtils.join(baseDir, `${name}.${newExtension.startsWith('.') ? newExtension.substring(1) : newExtension}`);
  },

  /**
   * Validates file path for security and existence
   */
  validateFilePath: (filePath: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!validateAndTrimString(filePath)) {
      errors.push('File path is required');
      return { isValid: false, errors };
    }
    
    const filename = PathUtils.basename(filePath);
    const filenameValidation = FileNameUtils.validate(filename);
    if (!filenameValidation.isValid) {
      errors.push(...filenameValidation.errors);
    }
    
    const pathValidation = SecurityUtils.validatePath(filePath);
    if (!pathValidation.isValid) {
      errors.push(...pathValidation.errors);
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Creates backup of file
   */
  createBackup: async (filePath: string): Promise<string> => {
    const backupPath = `${filePath}.backup.${Date.now().toString(36)}`;
    
    try {
      console.log(`Would create backup: ${backupPath}`);
      return backupPath;
    } catch (error) {
      handleError(error, 'PathFileUtils.createBackup', `Failed to create backup for file: ${filePath}`);
      throw error;
    }
  }
};