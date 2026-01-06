/**
 * Common Data Transformation Utilities
 * 
 * Centralized data transformation functions to eliminate code duplication across
 * the codebase. These utilities handle common transformation patterns including
 * string cleaning, JSON processing, object sanitization, and data masking.
 */

import { qerrors } from 'qerrors';

/**
 * Safely parses JSON with error handling and prototype pollution protection
 * @param jsonString - JSON string to parse
 * @param defaultValue - Default value to return on parsing failure
 * @returns Parsed JSON object or default value
 */
export function safeJsonParse(jsonString: string, defaultValue: any = null): any {
  if (typeof jsonString !== 'string') {
    return defaultValue;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    
    // Check for prototype pollution
    if (typeof parsed === 'object' && parsed !== null) {
      if (hasPrototypePollution(parsed)) {
        const error = new Error('Prototype pollution detected in JSON');
        qerrors(error, 'safeJsonParse');
        return defaultValue;
      }
    }
    
    return parsed;
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safeJsonParse', `JSON parsing failed for string length: ${jsonString.length}`);
    return defaultValue;
  }
}

/**
 * Checks for prototype pollution in objects
 * @param obj - Object to check
 * @returns True if prototype pollution is detected
 */
export function hasPrototypePollution(obj: any): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  for (const key of Object.keys(obj)) {
    if (dangerousKeys.includes(key)) {
      return true;
    }
    
    if (typeof obj[key] === 'object' && hasPrototypePollution(obj[key])) {
      return true;
    }
  }
  
  return false;
}

/**
 * Safely stringifies JSON with error handling
 * @param value - Value to stringify
 * @param defaultValue - Default value to return on stringification failure
 * @param options - Stringification options
 * @returns JSON string or default value
 */
export function safeJsonStringify(value: any, defaultValue: string = '{}', options: {
  indent?: number;
  maxDepth?: number;
} = {}): string {
  const { indent, maxDepth = 10 } = options;
  
  try {
    // Handle circular references
    const seen = new WeakSet();
    
    const replacer = (key: string, val: any) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      return val;
    };
    
    return JSON.stringify(value, replacer, indent);
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'safeJsonStringify', 'JSON stringification failed');
    return defaultValue;
  }
}

/**
 * Trims and cleans a string value
 * @param value - Value to clean
 * @param options - Cleaning options
 * @returns Cleaned string
 */
export function cleanString(value: any, options: {
  removeNewlines?: boolean;
  removeExtraSpaces?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  allowedChars?: RegExp;
} = {}): string {
  const {
    removeNewlines = false,
    removeExtraSpaces = false,
    toLowerCase = false,
    toUpperCase = false,
    allowedChars
  } = options;
  
  if (value === null || value === undefined) {
    return '';
  }
  
  let result = String(value).trim();
  
  // Remove newlines
  if (removeNewlines) {
    result = result.replace(/\r?\n/g, '');
  }
  
  // Remove extra spaces
  if (removeExtraSpaces) {
    result = result.replace(/\s+/g, ' ');
  }
  
  // Case transformation
  if (toLowerCase) {
    result = result.toLowerCase();
  } else if (toUpperCase) {
    result = result.toUpperCase();
  }
  
  // Filter allowed characters
  if (allowedChars) {
    result = result.replace(new RegExp(`[^${allowedChars.source}]`, 'g'), '');
  }
  
  return result;
}

/**
 * Masks a string while preserving some characters for debugging
 * @param value - String to mask
 * @param options - Masking options
 * @returns Masked string
 */
export function maskString(value: any, options: {
  visibleStart?: number;
  visibleEnd?: number;
  maskChar?: string;
} = {}): string {
  const { visibleStart = 4, visibleEnd = 4, maskChar = '*' } = options;
  
  if (!value || typeof value !== 'string') {
    return '[REDACTED]';
  }
  
  const minLength = visibleStart + visibleEnd + 1;
  
  if (value.length <= minLength) {
    return '[REDACTED]';
  }
  
  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  const maskedLength = value.length - visibleStart - visibleEnd;
  const masked = maskChar.repeat(Math.min(maskedLength, 12));
  
  return `${start}${masked}${end}`;
}

/**
 * Sanitizes a value for safe logging by redacting sensitive information
 * @param value - Value to sanitize
 * @returns Sanitized string representation
 */
export function sanitizeLogValue(value: any): string {
  const SENSITIVE_PATTERNS = [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /auth/i,
    /credential/i,
    /ssn/i,
    /credit.*card/i,
    /bank.*account/i
  ];
  
  if (value === null || value === undefined) {
    return 'null';
  }
  
  if (typeof value === 'string') {
    // Check for sensitive patterns
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(value)) {
        return '[REDACTED_SENSITIVE]';
      }
    }
    
    // Check for JWT tokens (3 base64 parts)
    if (value.split('.').length === 3) {
      const parts = value.split('.');
      const isBase64Like = parts.every(p => /^[A-Za-z0-9_-]+$/.test(p));
      if (isBase64Like && parts[0].length > 10 && parts[1].length > 10) {
        return '[REDACTED_TOKEN]';
      }
    }
    
    return value;
  }
  
  if (typeof value === 'object') {
    return '[Object]';
  }
  
  return String(value);
}

/**
 * Removes protocol from URL
 * @param url - URL to process
 * @returns URL without protocol
 */
export function stripProtocol(url: string): string {
  if (!url || typeof url !== 'string') {
    return url || '';
  }
  
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}

/**
 * Ensures URL has a protocol (defaults to https)
 * @param url - URL to process
 * @param defaultProtocol - Default protocol to use
 * @returns URL with protocol
 */
export function ensureProtocol(url: string, defaultProtocol: string = 'https'): string {
  if (!url || typeof url !== 'string') {
    return `${defaultProtocol}://`;
  }
  
  const trimmedUrl = url.trim();
  
  if (trimmedUrl === '') {
    return `${defaultProtocol}://`;
  }
  
  // Check if already has protocol
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Handle protocol-relative URLs
  if (trimmedUrl.startsWith('//')) {
    return `${defaultProtocol}:${trimmedUrl}`;
  }
  
  return `${defaultProtocol}://${trimmedUrl}`;
}

/**
 * Normalizes whitespace in a string
 * @param value - String to normalize
 * @param options - Normalization options
 * @returns Normalized string
 */
export function normalizeWhitespace(value: string, options: {
  collapseMultiple?: boolean;
  trim?: boolean;
  replaceNewlines?: boolean;
  replacement?: string;
} = {}): string {
  const {
    collapseMultiple = true,
    trim = true,
    replaceNewlines = true,
    replacement = ' '
  } = options;
  
  if (!value || typeof value !== 'string') {
    return '';
  }
  
  let result = value;
  
  // Replace newlines with spaces
  if (replaceNewlines) {
    result = result.replace(/\r?\n/g, replacement);
  }
  
  // Collapse multiple spaces
  if (collapseMultiple) {
    result = result.replace(/\s+/g, replacement);
  }
  
  // Trim
  if (trim) {
    result = result.trim();
  }
  
  return result;
}

/**
 * Converts a value to a specific type with error handling
 * @param value - Value to convert
 * @param targetType - Target type
 * @param defaultValue - Default value on conversion failure
 * @returns Converted value or default value
 */
export function convertType<T>(value: any, targetType: 'string' | 'number' | 'boolean' | 'array' | 'object', defaultValue: T): T {
  try {
    switch (targetType) {
      case 'string':
        return String(value) as T;
      
      case 'number':
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
          return defaultValue;
        }
        return num as T;
      
      case 'boolean':
        if (typeof value === 'boolean') {
          return value as T;
        }
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          return (lower === 'true' || lower === '1' || lower === 'yes') as T;
        }
        return Boolean(value) as T;
      
      case 'array':
        if (Array.isArray(value)) {
          return value as T;
        }
        if (typeof value === 'string') {
          try {
            return JSON.parse(value) as T;
          } catch {
            return [value] as T;
          }
        }
        return [value] as T;
      
      case 'object':
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return value as T;
        }
        if (typeof value === 'string') {
          try {
            return JSON.parse(value) as T;
          } catch {
            return defaultValue;
          }
        }
        return defaultValue;
      
      default:
        return defaultValue;
    }
  } catch (error) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'convertType', `Type conversion failed for target: ${targetType}`);
    return defaultValue;
  }
}

/**
 * Deep clones an object with circular reference protection
 * @param obj - Object to clone
 * @param options - Cloning options
 * @returns Cloned object
 */
export function deepClone(obj: any, options: {
  maxDepth?: number;
  handleCircular?: boolean;
} = {}): any {
  const { maxDepth = 10, handleCircular = true } = options;
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item, { maxDepth: maxDepth - 1, handleCircular }));
  }
  
  if (typeof obj === 'object') {
    const cloned: any = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key], { maxDepth: maxDepth - 1, handleCircular });
      }
    }
    
    return cloned;
  }
  
  return obj;
}

/**
 * Removes control characters from a string
 * @param value - String to clean
 * @returns String without control characters
 */
export function removeControlCharacters(value: string): string {
  if (!value || typeof value !== 'string') {
    return value || '';
  }
  
  return value.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitizes a filename by removing invalid characters
 * @param filename - Filename to sanitize
 * @param options - Sanitization options
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string, options: {
  maxLength?: number;
  replacement?: string;
  allowExtension?: boolean;
} = {}): string {
  const { maxLength = 255, replacement = '_', allowExtension = true } = options;
  
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }
  
  let result = filename.trim();
  
  // Remove invalid characters
  result = result.replace(/[<>:"/\\|?*\x00-\x1F]/g, replacement);
  
  // Remove control characters
  result = removeControlCharacters(result);
  
  // Handle reserved names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    ...Array.from({ length: 10 }, (_, i) => `COM${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `LPT${i + 1}`)
  ];
  
  const nameWithoutExt = allowExtension ? result.split('.').slice(0, -1).join('.') : result;
  const extension = allowExtension ? result.split('.').pop() : '';
  
  if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
    result = `${replacement}${nameWithoutExt}${extension ? '.' + extension : ''}`;
  }
  
  // Limit length
  if (result.length > maxLength) {
    result = result.slice(0, maxLength);
  }
  
  // Remove trailing dots and spaces
  result = result.replace(/[. ]+$/, '');
  
  return result || 'file';
}